<template>
  <tr>
    <td v-if="status === $userStatus.Succsess">{{ lastname }}</td>
    <td v-else><input type="text" class="input-text" v-model="lastname" placeholder="Іванов" autofocus autocomplete="off" :disabled="$parent.sending"></td>

    <td v-if="status === $userStatus.Succsess">{{ firstname }}</td>
    <td v-else><input type="text" class="input-text" v-model="firstname" placeholder="ТарасМаксимович" autocomplete="off" :disabled="$parent.sending"></td>

    <td v-if="usernameHasError" class="username-error">Недостатньо даних</td>
    <td v-else>{{ username }}</td>

    <td>{{ password }}</td>

    <td v-if="status === $userStatus.Succsess">{{ entryDate }}</td>
    <td v-else>
      <select v-model="entryDate" :disabled="$parent.sending" class="input-select">
        <option :value="false" disabled>Оберіть клас</option>
        <option v-for="grade in grades" :key="grade.unit" :value="grade.unit">{{ grade.value }}</option>
      </select>
    </td>

    <td><button class="button button--del" title="Видалити строку" @click="$parent.removeLine(idx)" :disabled="$parent.sending">X</button></td>

    <td>
      <span v-if="status === $userStatus.Initial" tip="Редагування рядка" class="tooltip">Ред.</span>
      <span v-else-if="status === $userStatus.Succsess" tip="Учень додан до ActiveDirectory" class="tooltip tooltip--success">Успіх</span>
      <span v-else-if="status === $userStatus.Error" :tip="msg" class="tooltip tooltip--error">Помилка</span>
      <span v-else-if="status === $userStatus.Pending" tip="Сервер оброблює запит" class="tooltip">Обробка</span>
    </td>
  </tr>
</template>

<script>
import { UserStatus } from './status'

const notUkrainian = /[^а-щА-ЩьЬюЮяЯєЄіІїЇґҐ’']+/g
const ucChars = /[А-ЩЬЮЯЄІЇҐ]/
const lcChars = /[а-щьюяєіїґ’']/

const lastnameRe = new RegExp(`^${ucChars.source}${lcChars.source}+`)
const firstnamePatronymicRe = new RegExp(`${ucChars.source}${lcChars.source}+${ucChars.source}${lcChars.source}+$`)
const fpInFlpRe = new RegExp(`${lastnameRe.source}(${firstnamePatronymicRe.source})`)
const ucCharsInFirstnameRe = new RegExp(`^(${ucChars.source})${lcChars.source}+(${ucChars.source})${lcChars.source}+$`)

function ucfirst (value) {
  return value.charAt(0).toUpperCase() + value.substr(1)
}

var mapEnFromUa = ['a', 'b', 'v', 'g', 'g', 'd', 'e', 'ye', 'zh', 'z', 'y', 'i', 'yi', 'y', 'k', 'l', 'm', 'n', 'o', 'p', 'r', 's', 't', 'u', 'f', 'h', 'ts', 'ch', 'sh', 'sh', '', 'yu', 'ya']
const mapUa = ['а', 'б', 'в', 'г', 'ґ', 'д', 'е', 'є', 'ж', 'з', 'и', 'і', 'ї', 'й', 'к', 'л', 'м', 'н', 'о', 'п', 'р', 'с', 'т', 'у', 'ф', 'х', 'ц', 'ч', 'ш', 'щ', 'ь', 'ю', 'я']

export default {
  name: 'user-object',
  props: {
    idx: {
      type: Number,
      required: true
    }
  },
  data () {
    return {
      user_: this.$parent.users[this.idx]
    }
  },
  computed: {
    grades () {
      // TODO: [06 - 12], [01 - 05]
      const academicYear = 2019 + 1

      return [
        { value: '5 - А', unit: `${academicYear - 5}` },
        { value: '5 - Б', unit: `${academicYear - 5}-b` },
        { value: '6 - А', unit: `${academicYear - 6}` },
        { value: '7 - А', unit: `${academicYear - 7}` },
        { value: '8 - А', unit: `${academicYear - 8}` },
        { value: '9 - А', unit: `${academicYear - 9}` },
        { value: '10 - А', unit: `${academicYear - 10}` },
        { value: '11 - А', unit: `${academicYear - 11}` }
      ]
    },
    firstname: {
      get () {
        return this.user_.firstname
      },
      set (val) {
        this.user_.firstname = '***' // force set value

        var nonUkCleared = val.replace(notUkrainian, '')
        if (nonUkCleared.length) {
          const fp = nonUkCleared.match(firstnamePatronymicRe)
          if (fp) {
            this.user_.firstname = fp[0]
          } else {
            this.user_.firstname = ucfirst(nonUkCleared)
          }
        } else {
          this.user_.firstname = ''
        }
        this.updateUsername()
      }
    },
    lastname: {
      get () {
        return this.user_.lastname
      },
      set (val) {
        this.user_.lastname = '***' // force set value

        var nonUkCleared = val.replace(notUkrainian, '')
        if (nonUkCleared.length) {
          const lastname = nonUkCleared.match(lastnameRe)
          if (lastname) {
            this.user_.lastname = lastname[0]

            const fp = nonUkCleared.match(fpInFlpRe)
            if (fp) {
              this.user_.firstname = fp[1]
            }
          } else {
            this.user_.lastname = ucfirst(nonUkCleared)
          }
        } else {
          this.user_.lastname = ''
        }
        this.updateUsername()
      }
    },
    password () {
      return this.user_.password
    },
    entryDate: {
      get () {
        return this.user_.entryDate
      },
      set (val) {
        this.user_.entryDate = val
      }
    },
    username () {
      return this.user_.username
    },
    usernameHasError () {
      return this.username.length < 1
    },
    status () {
      return this.user_.status
    },
    $userStatus () {
      return UserStatus
    },
    msg () {
      return this.user_.msg
    }
  },
  methods: {
    updateUsername () {
      var uppercaseLetters = this.firstname.match(ucCharsInFirstnameRe)
      if (!this.lastname.length || !uppercaseLetters || (uppercaseLetters.length !== 3)) {
        this.user_.username = ''
      } else {
        this.user_.username = this.translitStr(this.lastname) + '_' +
          this.translitStr(uppercaseLetters[1]) + '_' +
          this.translitStr(uppercaseLetters[2])
      }
    },
    translitStr (strIn) {
      strIn = strIn.toLowerCase()
      var out = ''
      for (var i = 0; i < strIn.length; ++i) {
        var currentChar = strIn[i]
        var churNum = -1
        if ((churNum = mapUa.indexOf(currentChar)) >= 0) {
          out += mapEnFromUa[churNum]
        }
      }

      return out
    }
  }
}
</script>

<style>
.username-error {
  font-style: italic;
  font-size: 0.875rem;
  color: #757575;
}

.button--del {
  width: 24px;
  padding: 0;
}

.tooltip {
  position: relative;
  user-select: none;
  padding: 2px 8px;
  border-radius: 2px;
}

.tooltip--success {
  color: #E8F5E9;
  background: #43A047;
}

.tooltip--error {
  color: #FBE9E7;
  background: #DD2C00;
}

.tooltip:hover::after {
  text-align: center;
  position: absolute;
  width: 180px;
  top: calc(100% + 8px);
  left: -90px;
  display: block;
  padding: 6px 10px;
  border-radius: 2px;
  background: #212121;
  color: #EEEEEE;
  font-size: 0.875rem;
  content: attr(tip);
  z-index: 1;
  box-shadow: 0 2px 2px 0 rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.2), 0 1px 5px 0 rgba(0,0,0,.12);
}
</style>

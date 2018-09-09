<template>
  <tr>
    <td v-if="status === 1">{{ lastname }}</td>
    <td v-else><input type="text" class="input-text" v-model="lastname" autofocus :disabled="$parent.sending"></td>
    <td v-if="status === 1">{{ firstname }}</td>
    <td v-else><input type="text" class="input-text" v-model="firstname" :disabled="$parent.sending"></td>
    <td :class="{ 'username-error': !this.usernameStatus }">{{ username }}</td>
    <td>{{ password }}</td>
    <td v-if="status === 1">{{ entryDate }}</td>
    <td v-else>
      <select v-model="entryDate" :disabled="$parent.sending" class="input-select">
        <option :value="false" disabled>Оберіть клас</option>
        <option v-for="n in 7" :key="n" :value="(2017 - 3 - n)">{{ (n + 4) + ' - А' }}</option>
      </select>
    </td>
    <td><button class="button button--del" title="Видалити строку" @click="$parent.removeLine(idx)" :disabled="$parent.sending">X</button></td>
    <td>
      <span v-if="status === 0" tip="Редагування рядка" class="tooltip">Ред.</span>
      <span v-else-if="status === 1" tip="Учень додан до ActiveDirectory" class="tooltip tooltip--success">Успіх</span>
      <span v-else-if="status === 2" :tip="msg" class="tooltip tooltip--error">Помилка</span>
      <span v-else-if="status === 3" tip="Сервер оброблює запит" class="tooltip">Обробка</span>
    </td>
  </tr>
</template>

<script>
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
      user_: this.$parent.users[this.idx],
      usernameStatus: false
    }
  },
  computed: {
    firstname: {
      get () {
        return this.user_.firstname
      },
      set (val) {
        this.user_.firstname = '***' // force set value
        var nonUkCleared = val.replace(/[^а-щА-ЩЬьЮюЯяЇїІіЄєҐґ]/g, '')
        var uppercaseLetters = nonUkCleared.match(/[А-ЩЮЯЇІЄҐ]/g)
        if (uppercaseLetters.length === 3) {
          this.user_.firstname = nonUkCleared.slice(nonUkCleared.indexOf(uppercaseLetters[1]))
        } else {
          this.user_.firstname = nonUkCleared
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
        var nonUkCleared = val.replace(/[^а-щА-ЩЬьЮюЯяЇїІіЄєҐґ]/g, '')
        var uppercaseLetters = nonUkCleared.match(/[А-ЩЮЯЇІЄҐ]/g)
        if (uppercaseLetters.length > 1) {
          this.user_.lastname = nonUkCleared.substr(0, nonUkCleared.indexOf(uppercaseLetters[1]))
        } else {
          this.user_.lastname = nonUkCleared
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
      if (!this.user_.username.length) {
        this.usernameStatus = false
        return 'Недостатньо даних'
      } else {
        this.usernameStatus = true
        return this.user_.username
      }
    },
    status: {
      get () {
        return this.user_.status
      }
    },
    msg: {
      get () {
        return this.user_.msg
      }
    }
  },
  methods: {
    updateUsername () {
      var uppercaseLetters = this.firstname.match(/^([А-ЩЮЯЇІЄҐ])[а-щьюяїієґ]+([А-ЩЮЯЇІЄҐ])[а-щьюяїієґ]+$/)
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

<template>
  <div class="container">
    <div class="row">
      <div class="col">
        <h1>Додавання користувачів</h1>
      </div>
    </div>
    <div class="row">
      <div class="col"></div>
      <div class="col-auto">
        <div class="school__btns">
          <label class="button button--school" :class="{ 'is-active': (school === 'academly') }" for="school-academly">Академічний ліцей</label>
          <label class="button button--school" :class="{ 'is-active': (school === 'real') }" for="school-real">Частная школа &laquo;РЕАЛ&raquo;</label>
        </div>
        <div style="display: none;">
          <input v-model="school" type="radio" value="academly" id="school-academly">
          <input v-model="school" type="radio" value="real" id="school-real">
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col">
        <table>
          <thead>
            <tr>
              <th>Прізвище</th>
              <th>Ім'я По батькові</th>
              <th>Ім'я користувача</th>
              <th style="width: 100px;">Пароль</th>
              <th style="width: 106px;">Клас</th>
              <th style="width: 48px;">Дії</th>
              <th style="width: 108px;">Статус</th>
            </tr>
          </thead>
          <tbody>
            <user v-for="(user, idx) in users" :idx="idx" :key="user.vkey"/>
          </tbody>
        </table>
      </div>
    </div>
    <div class="row" style="margin: 24px 0;">
      <button class="button button--addline" @click="appendLine()" :disabled="sending">+ Додати строку</button>
      <button class="button button--adusers" @click="addUsers()" :disabled="sending">Додати користувачів</button>
    </div>
    <div class="row">
      <div class="col">
        <input type="password" class="input-text" v-model="secretkey" placeholder="Ключ доступу" @focus="secretkeyError = 0" @input="secretkeyError = 0">
        <div v-if="secretkeyError === 1" class="secretkey-error">Схоже, що ви забули вказати ключ доступу</div>
        <div v-else-if="secretkeyError === 2" class="secretkey-error">Ключ доступу не вірний!</div>
      </div>
    </div>
    <!--div class="row"><pre>{{ $data }}</pre></div-->
  </div>
</template>

<script>
import User from './User'
import axios from 'axios'
import { UserStatus } from './status'

export default {
  name: 'ad-users',
  components: {
    User
  },
  data () {
    return {
      users: [],
      vkey: 0,
      sending: false,
      secretkey: '',
      secretkeyError: 0,
      school: 'academly'
    }
  },
  created () {
    this.appendLine()
  },
  methods: {
    addUsers () {
      if (this.users.length) {
        if (!this.secretkey.length) {
          this.secretkeyError = 1
        } else {
          this.sending = true
          var self = this
          this.addNextUser(0).then(() => {
            self.sending = false
          })
        }
      }
    },
    addNextUser (idx) {
      return new Promise((resolve, reject) => {
        var user = this.users[idx]
        if (idx > this.users.length - 1) {
          return resolve() // end reached
        }
        if (user.status === UserStatus.Succsess) {
          return resolve(this.addNextUser(idx + 1))
        }

        var self = this
        if (!user.username.length || !user.entryDate) {
          user.status = UserStatus.Error
          user.msg = 'Заповніть усі поля'
          return resolve(self.addNextUser(idx + 1))
        } else {
          user.status = UserStatus.Pending
          return axios.post('/api/aduser', {
            user: {
              firstname: user.firstname,
              lastname: user.lastname,
              password: user.password,
              unit: this.school + '-' + user.entryDate,
              username: user.username
            },
            secretkey: this.secretkey
          }).then((response) => {
            if ((response.data).data === 'OK') {
              user.status = UserStatus.Succsess
            } else {
              if ((response.data).data === 'ERROR: secretkey') {
                self.secretkeyError = 2
                return resolve()
              } else {
                user.status = UserStatus.Error
                user.msg = (response.data).data
              }
            }
            return resolve(self.addNextUser(idx + 1))
          }).catch(() => {
            user.status = UserStatus.Error
            user.msg = 'Невідома помилка (дивіться F12)'
            return resolve(self.addNextUser(idx + 1))
          })
        }
      })
    },
    appendLine () {
      this.users.push({
        firstname: '',
        lastname: '',
        password: this.generatePassword(6),
        entryDate: false,
        username: '',
        status: UserStatus.Initial,
        msg: '',
        vkey: ++this.vkey
      })
    },
    removeLine (idx) {
      this.users.splice(idx, 1)
    },
    generatePassword (length) {
      // const chars = 'abcdefghijklmnopqrstuvwxyz'
      const nums = '1234567890'
      var pass = ''

      // charNum = Math.floor(Math.random() * 26);
      // pass += chars.charAt(charNum);
      for (var i = 0; i < length; i++) {
        var charNum = Math.floor(Math.random() * 10)
        pass += nums.charAt(charNum)
      }
      return pass
    }
  }
}
</script>

<style>
table {
  margin-top: 24px;
  padding: 0px;
  width: 100%;
  max-width: 100%;
  border: 1px solid #B39DDB;
  border-radius: 4px;
  border-collapse: separate;
  table-layout: fixed;
}

th, td {
  padding: 8px 12px;
}

.input-text,
.input-select {
  line-height: 36px;
  border: 0;
  padding: 0;
  outline: none;
  border-bottom: 2px solid #B39DDB;
  transition: border-color 0.24s;
  width: 100%;
}

.input-text:active,
.input-text:hover,
.input-text:focus {
  border-color: #673AB7;
}

.input-text[disabled] {
  border-color: #B39DDB;
}

.input-select {
  padding: 8px 0;
  height: 38px;
}

.button {
  user-select: none;
  background: transparent;
  border: none;
  border-radius: 2px;
  padding: 0;
  margin: 0;
  line-height: 24px;
  font-size: 0.875rem;
  height: 24px;
  cursor: pointer;
  padding: 0 8px;
  background: #E0E0E0;
  color: #424242;
}

.button:hover {
  box-shadow: 0 2px 2px 0 rgba(0,0,0,.14), 0 3px 1px -2px rgba(0,0,0,.2), 0 1px 5px 0 rgba(0,0,0,.12);
}

.button[disabled] {
  box-shadow: none;
  opacity: 0.6;
  cursor: default;
}

.button--addline,
.button--adusers {
  font-size: 1rem;
  line-height: 32px;
  height: 32px;
  padding: 0 12px;
}

.button--adusers {
  margin-left: 16px;
  background: #673AB7;
  color: #EDE7F6;
}

.secretkey-error {
  font-size: 0.875rem;
  font-style: italic;
  color: #DD2C00;
}

.button--school {
  background: transparent;
  border: 1px solid #673AB7;
  font-size: 1rem;
  line-height: 32px;
  height: 32px;
  padding: 0 12px;
}

.button--school.is-active {
  background: #673AB7;
  color: #EDE7F6;
}

.button--school:first-child {
  border-radius: 2px 0 0 2px;
  border-right: none;
}

.button--school:last-child {
  border-radius: 0 2px 2px 0;
  border-left: none;
}

.school__btns {
  display: flex;
  flex-direction: row;
}
</style>

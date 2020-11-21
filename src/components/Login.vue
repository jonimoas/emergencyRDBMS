<template>
  <div align="center">
    <img alt="Vue logo" src="../assets/logo.png" />
    <br />
    <vc-col :span="8" sm12 xs24>
      <vc-button-split
        color="black"
        :dark="true"
        :items="dialects"
        header-click-value="dialect"
        mode="menu"
        :dropdown-z-index="500"
        v-model="dialect"
        @input="onInput($event)"
      >{{dialect!=""?dialect:"Dialect"}}</vc-button-split>
      <vc-text type="text" :placeholder="'Host'" v-model="host" name="host"></vc-text>
      <vc-text type="text" :placeholder="'Port'" v-model="port" name="port"></vc-text>
      <br />
      <vc-text type="text" :placeholder="'User'" v-model="user" name="user"></vc-text>
      <vc-text type="password" :placeholder="'Password'" v-model="password" name="password"></vc-text>
      <vc-text type="text" :placeholder="'Database'" v-model="database" name="database"></vc-text>
      <br />
      <vc-button @click="login">Login</vc-button>
    </vc-col>
  </div>
</template>
<script>
export default {
  data() {
    return {
      dialect: "",
      host: "",
      port: "",
      user: "",
      password: "",
      database: "", // data
      dialects: [
        {
          label: "Postgres",
          value: "postgres"
        },
        {
          label: "MySQL",
          value: "mysql"
        },
        {
          label: "MariaDB",
          value: "mariadb"
        },
        {
          label: "MSSQL",
          value: "mssql"
        }
      ]
    };
  },
  methods: {
    // @input event handler
    onInput(event) {
      console.log(this.dialect);
    },
    login: async function() {
      let mainPort = this.$cookies.get("rdbmsport");
      console.log(window.location)
      console.log(
          window.location.origin +
          ":"+mainPort+"/api/createSession?db=" +
          this.database +
          "&dialect=" +
          this.dialect +
          "&user=" +
          this.user +
          "&password=" +
          this.password +
          "&port=" +
          this.port
      );
      let response = await fetch(
          window.location.origin +
          ":"+mainPort+"/api/createSession?db=" +
          this.database +
          "&dialect=" +
          this.dialect +
          "&user=" +
          this.user +
          "&password=" +
          this.password +
          "&port=" +
          this.port
      );
      response = await response.json();
      console.log(response);
      this.$store.commit("newTables", response.tables);
      this.$store.commit("session", response.session);
      this.$router.replace({ name: "db" });
      console.log(this.$store.getters.getTables);
    }
  }
};
</script>
<style></style>
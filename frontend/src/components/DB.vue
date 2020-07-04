<template>
  <div>
    <vc-layout style="padding:20px;">
      <vc-col :span="4" sm12 xs24 align="center" style="border-style:solid;padding:5px;">
        <vc-button @click="logout">Logout</vc-button>
        <br />
        <br />
        <br />
        <vc-select
          width="200"
          v-model="currentTable"
          label="Select Main Table"
          @input="newTable"
          searchable
          :items="tablelist"
          name="currentTable"
        ></vc-select>
        <vc-select
          width="200"
          v-model="field1"
          label="Select Join Key"
          searchable
          :items="tableKeys"
          name="field1"
        ></vc-select>
        <vc-select
          width="200"
          v-model="secondTable"
          label="Select Second Table"
          searchable
          :items="tablelist"
          name="secondTable"
        ></vc-select>
        <vc-text type="text" :placeholder="'Field 2'" v-model="field2" name="field2" width="200"></vc-text>
        <vc-button @click="executeJoin">Join</vc-button>
        <vc-text type="text" :placeholder="'Query'" v-model="query" name="query" width="200"></vc-text>
        <vc-button @click="execute">Execute</vc-button>
      </vc-col>
      <vc-col :span="20" sm12 xs24>
        <DataTable
          :data="tableData"
          :header-fields="tableFields"
          style="border-style:solid;padding:5px;"
        ></DataTable>
      </vc-col>
    </vc-layout>
  </div>
</template>

<script>
import { DataTable } from "v-datatable-light";
export default {
  components: {
    DataTable
  },
  data() {
    return {
      tablelist: [],
      currentTable: "",
      secondTable: "",
      tableData: [],
      tableKeys: [],
      query: "",
      field1: "",
      field2: "",
      session: "",
      tableFields: []
    };
  },
  mounted() {
    this.tablelist = this.$store.getters.getTables.map(function(r) {
      return { label: r, value: r };
    });
    this.session = this.$store.getters.getSession;
  },
  methods: {
    logout: async function() {
      let result = await fetch(
        window.location.href.split("//")[0] +
          "//" +
          window.location.href.split("//")[1].split(":")[0] +
          ":16000/api/endSession?session=" +
          this.session
      );
      this.$store.commit("logout");
      this.$router.replace({ name: "login" });
    },
    newTable: async function() {
      console.log(this.currentTable);
      let result = await fetch(
        window.location.href.split("//")[0] +
          "//" +
          window.location.href.split("//")[1].split(":")[0] +
          ":16000/api/getTable?table=" +
          this.currentTable[0].value +
          "&session=" +
          this.session
      );
      this.tableData = await result.json();
      this.tableKeys = [];
      if (this.tableData.length != 0) {
        for (var k in this.tableData[0]) {
          this.tableKeys.push(k);
        }
      }
      this.tableFields = this.tableKeys.map(function(r) {
        return { name: r, label: r };
      });
      this.tableKeys = this.tableKeys.map(function(r) {
        return { label: r, value: r };
      });

      console.log(this.tableKeys);
    },
    execute: async function() {
      let result = await fetch(
        window.location.href.split("//")[0] +
          "//" +
          window.location.href.split("//")[1].split(":")[0] +
          ":16000/api/runQuery",
        {
          method: "POST",
          headers: {
            "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
          },
          body: "query=" + this.query + "&session=" + this.session
        }
      );
      this.tableData = await result.json();
      this.tableKeys = [];
      if (this.tableData.length != 0) {
        for (var k in this.tableData[0]) {
          this.tableKeys.push(k);
        }
      }
      this.tableFields = this.tableKeys.map(function(r) {
        return { name: r, label: r };
      });
      this.tableKeys = this.tableKeys.map(function(r) {
        return { label: r, value: r };
      });
      console.log(this.tableKeys);
    },
    executeJoin: async function() {
      this.query =
        "SELECT * FROM " +
        this.currentTable[0].value +
        " INNER JOIN " +
        this.secondTable[0].value +
        " ON " +
        this.currentTable[0].value +
        "." +
        this.field1[0].value +
        " = " +
        this.secondTable[0].value +
        "." +
        this.field2;
      await this.execute();
    }
  }
};
</script>
<style>
#v-datatable-light .header-item {
  cursor: pointer;
  color: #337ab7;
  transition: color 0.15s ease-in-out;
}

#v-datatable-light .header-item:hover {
  color: #ed9b19;
}

#v-datatable-light .header-item.no-sortable {
  cursor: default;
}
#v-datatable-light .header-item.no-sortable:hover {
  color: #337ab7;
}

#v-datatable-light .header-item .th-wrapper {
  display: flex;
  width: 100%;
  height: 100%;
  font-weight: bold;
}

#v-datatable-light .header-item .th-wrapper.checkboxes {
  justify-content: center;
}

#v-datatable-light .header-item .th-wrapper .arrows-wrapper {
  display: flex;
  flex-direction: column;
  margin-left: 10px;
  justify-content: space-between;
}

#v-datatable-light .header-item .th-wrapper .arrows-wrapper.centralized {
  justify-content: center;
}

#v-datatable-light .arrow {
  transition: color 0.15s ease-in-out;
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
}
#v-datatable-light .tbodyTr {
  border-style: solid;
  padding: 5px;
}
#v-datatable-light .arrow.up {
  border-bottom: 8px solid #337ab7;
}

#v-datatable-light .arrow.up:hover {
  border-bottom: 8px solid #ed9b19;
}

#v-datatable-light .arrow.down {
  border-top: 8px solid #337ab7;
}

#v-datatable-light .arrow.down:hover {
  border-top: 8px solid #ed9b19;
}

#v-datatable-light .footer {
  display: flex;
  justify-content: space-between;
  width: 500px;
}
</style>

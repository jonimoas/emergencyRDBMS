<template>
<div>
    <vc-layout style="padding: 20px">
        <vc-col :span="colSpan" sm12 xs24 align="center" style="border-style: solid; padding: 5px">
            <vc-button @click="changeSize">{{sizeText}}</vc-button>
            <br />
            <br />
            <vc-button @click="logout">Logout</vc-button>
            <br />
            <br />
            <br />
            <vc-select width="200" v-model="currentTable" label="Select Main Table" @input="newTable" searchable :items="tablelist" name="currentTable"></vc-select>
            <vc-collapsible name="collapsible-main" :multiple="false">
                <vc-collapsible-item label="Join">
                    <vc-select width="200" v-model="field1" label="Select Join Key" searchable :items="tableKeys" name="field1"></vc-select>
                    <vc-select width="200" v-model="secondTable" label="Select Second Table" searchable :items="tablelist" name="secondTable" @input="newSecondTable"></vc-select>
                    <vc-select type="text" :placeholder="'Field 2'" v-model="field2" name="field2" label="Select Join Key" searchable width="200" :items="secondTableKeys"></vc-select>
                    <vc-select type="text" :placeholder="'Join Type'" v-model="joinType" name="joinType" label="Select Join Type" searchable width="200" :items="
                ['left', 'right', 'inner'].map(function (r) {
                  return { name: r, label: r };
                })
              "></vc-select>
                    <vc-button @click="executeJoin">Join</vc-button>
                </vc-collapsible-item>
                <vc-collapsible-item label="Insert">
                    <vc-select v-for="f in Object.keys(tableDBFields)" v-if="
                (tableDBFields[f]['foreignKey'] &&
                tableDBFields[f]['foreignKey']['contype'] == 'f' &&
                !tableDBFields[f]['primaryKey'])&&foreignData[f]!=undefined
              " type="text" :label="f" v-model="foreignFields[f]" :name="f" searchable width="200" :items="foreignData[f]"></vc-select>
                    <vc-text v-for="f in Object.keys(tableDBFields)" v-if="
                !(tableDBFields[f]['foreignKey']&&
                tableDBFields[f]['foreignKey']['contype'] == 'f') ||
                tableDBFields[f]['primaryKey']
              " type="text" :placeholder="f" name="f" v-model="insertFields[f]"></vc-text>
                    <vc-button @click="insert">Insert</vc-button>
                </vc-collapsible-item>
            </vc-collapsible>

        </vc-col>
        <vc-col :span="24-colSpan" sm12 xs24>
            <vc-text type="text" :placeholder="'Query'" v-model="query" name="query"></vc-text>
            <vc-button @click="execute">Execute</vc-button>
            <br>
            <br>
            <DataTable :data="tableData" :header-fields="tableFields" style="border-style: solid; padding: 5px"></DataTable>
            <vc-alert color="error" icon="error" v-if="exceptionContent!=''">
                {{exceptionContent}}
            </vc-alert>
        </vc-col>
    </vc-layout>
</div>
</template>

<script>
import {
    DataTable
} from "v-datatable-light";
export default {
    components: {
        DataTable,
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
            tableFields: [],
            secondTableKeys: [],
            joinType: "",
            tableDBFields: [],
            insertFields: {},
            foreignFields: {},
            foreignData: {},
            colSpan: 4,
            sizeText: ">>",
            exceptionContent: "",
            port: ""
        };
    },
    mounted() {
        this.tablelist = Object.keys(this.$store.getters.getTables).map(function (
            r
        ) {
            return {
                label: r,
                value: r
            };
        });
        this.session = this.$store.getters.getSession;
        this.port = this.$cookies.get("rdbmsport");
    },
    methods: {
        changeSize: function () {
            if (this.colSpan == 4) {
                this.colSpan = 12;
                this.sizeText = "<<";
            } else {
                this.colSpan = 4;
                this.sizeText = ">>";
            }
        },
        logout: async function () {
            let result = await fetch(
                window.location.origin +
                ":" + this.port + "/api/endSession?session=" +
                this.session
            );
            this.$store.commit("logout");
            this.$router.replace({
                name: "login"
            });
        },
        newTable: async function () {
            this.exceptionContent = "";
            this.tableDBFields = this.$store.getters.getTables[
                this.currentTable[0].value
            ];
            this.foreignData = {};
            this.insertFields = {};
            this.foreignFields = {};
            for (const f of Object.keys(this.tableDBFields)) {
                if (this.tableDBFields[f]['foreignKey'] &&
                    this.tableDBFields[f]['foreignKey']['contype'] == 'f' &&
                    !this.tableDBFields[f]['primaryKey']) {
                    this.foreignData[f] = (await (await fetch(
                        window.location.origin +
                        ":" + this.port + "/api/getTable?table=" +
                        this.tableDBFields[f]["foreignKey"]["target_table"] +
                        "&session=" +
                        this.session
                    )).json()).map(function (
                        r
                    ) {
                        return {
                            label: JSON.stringify(r),
                            name: r.id
                        };
                    });
                    this.foreignFields[f] = []
                }
            }
            let result = await fetch(
                window.location.origin +
                ":" + this.port + "/api/getTable?table=" +
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
            this.tableFields = this.tableKeys.map(function (r) {
                return {
                    name: r,
                    label: r
                };
            });
            this.tableKeys = this.tableKeys.map(function (r) {
                return {
                    label: r,
                    value: r
                };
            });
            console.log(this.tableKeys);
        },
        newSecondTable: async function () {
            console.log(this.currentTable);
            let result = await fetch(
                window.location.origin +
                ":" + this.port + "/api/getTable?table=" +
                this.secondTable[0].value +
                "&session=" +
                this.session
            );
            let tempData = await result.json();
            this.tableKeys = [];
            if (tempData.length != 0) {
                for (var k in tempData[0]) {
                    this.secondTableKeys.push(k);
                }
            }
            this.secondTableKeys = this.secondTableKeys.map(function (r) {
                return {
                    label: r,
                    value: r
                };
            });
            console.log(this.tableKeys);
        },
        execute: async function () {
            this.exceptionContent = "";
            let result = await fetch(
                window.location.origin +
                ":" + this.port + "/api/runQuery", {
                    method: "POST",
                    headers: {
                        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                    },
                    body: "query=" + this.query + "&session=" + this.session,
                }
            );
            let resp = await result.json();
            if (resp.exception) {
                this.exceptionContent = resp.exception
            } else {
                this.tableData = resp;
                this.tableKeys = [];
                if (this.tableData.length != 0) {
                    for (var k in this.tableData[0]) {
                        this.tableKeys.push(k);
                    }
                }
                this.tableFields = this.tableKeys.map(function (r) {
                    return {
                        name: r,
                        label: r
                    };
                });
                this.tableKeys = this.tableKeys.map(function (r) {
                    return {
                        label: r,
                        value: r
                    };
                });
                console.log(this.tableKeys);
            }
        },
        executeJoin: async function () {
            console.log(this.joinType);
            this.query =
                "SELECT * FROM " +
                this.currentTable[0].value +
                " " +
                this.joinType[0].name +
                " JOIN " +
                this.secondTable[0].value +
                " ON " +
                this.currentTable[0].value +
                "." +
                this.field1[0].value +
                " = " +
                this.secondTable[0].value +
                "." +
                this.field2[0].value;
            await this.execute();
        },
        insert: async function () {
            console.log(this.tableFields);
            let headerString = "";
            let valueString = "";
            valueString = Object.keys(this.insertFields).map(
                    (r) => {
                        if (isNaN(this.insertFields[r])) {
                            return "'" + this.insertFields[r] + "'"
                        }
                        return this.insertFields[r]
                    }
                ) +
                (Object.keys(this.foreignFields).length > 0 ? "," : "") +
                Object.keys(this.foreignFields).map(
                    (r) => {
                        if (this.foreignFields[r].length > 0) {
                            return JSON.stringify(this.foreignFields[r][0]["name"])
                        }
                        return "null"
                    }
                )
            headerString = Object.keys(this.insertFields) +
                (Object.keys(this.foreignFields).length > 0 ? "," : "") +
                Object.keys(this.foreignFields)
            this.query =
                "INSERT INTO " +
                this.currentTable[0].label +
                " (" + headerString + ") values (" + valueString + ")"
            await this.execute();
        },
    },
};
</script>

<style>
td,
th {
    border-style: solid;
    border-width: 1px;
}

.vc-select-item-selected {
    width: 100%;
}
</style>

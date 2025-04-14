<template>
  <div class="data-serach">
    <small-nav></small-nav>
    <!-- <back-profile title="材料数据"></back-profile> -->

    <div class="con">
      <el-container style="height:88vh">
        <el-aside width="240px">
          <div class="search_box">
            <el-input placeholder="请输入合金名称" v-model="searchValue" size="mini">
              <el-button slot="append" @click="searchFun" icon="el-icon-search"></el-button>
              <el-button slot="append" @click="searchMoreFun"  icon="el-icon-menu">

              </el-button>
            </el-input>
          </div>

          <el-menu :default-active="defaultActive" :unique-opened="true">
            <el-submenu :index="item.index" v-for="(item,index) in menuData" :key="index">
              <template slot="title">{{ item.name }}</template>
              <el-menu-item @click="changeFun(item.name,self)" v-for="(self,key) in item.list" :key="key"  :index="self.index">{{self.name }}</el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
          <el-container>
                <!-- 测试 -->
           <!-- <div>
            <button @click="menuFun()">读取Excel文件</button>
          </div>   -->
              <!-- <el-header style="text-align: right; font-size: 14px">
                  <el-input placeholder="请输入内容" v-model="input" class="input-with-select">
                      <el-button slot="append" icon="el-icon-search"></el-button>
                  </el-input>
              </el-header> -->
              <el-main>
                <el-breadcrumb separator-class="el-icon-arrow-right">
                      <el-breadcrumb-item >{{name1}}</el-breadcrumb-item>
                      <el-breadcrumb-item>{{ name2 }}</el-breadcrumb-item>
                  </el-breadcrumb>
                  <div class="content">
                      <el-tabs v-model="activeName" @tab-click="tabClick" type="card" >
                          <el-tab-pane label="合金介绍" name="0"></el-tab-pane>
                          <el-tab-pane label="物理、弹性和化学性能" name="1"></el-tab-pane>
                          <el-tab-pane label="力学性能" name="2"></el-tab-pane>
                          <el-tab-pane label="工艺性能与要求" name="3"></el-tab-pane>
                          <el-tab-pane label="组织结构" name="4"></el-tab-pane>
                      </el-tabs>
                      <div class="nr">
                        <div v-if="introduce.length>0" v-for="(item,index) in introduce" >
                          <div class="tit1">{{item.name}}</div>
                          <div class="txt">{{item.con.replace(/@@/g, "\n")}}</div>
                          <div class="table1" v-if="item.tableData">
                                <el-table size="mini"  :data="item.tableData" style="width: 100%">
                                  <el-table-column
                                    v-for="column in item.tableColumns"
                                    :key="column.prop"
                                    :prop="column.prop"
                                    :label="column.label">
                                  </el-table-column>
                                </el-table>
                              </div>
                              <div class="echartBox" v-if="item.seriesData">
                                <div :id="`echarts${item.echartMsg.echartId}`"  class="echart" ></div>
                              </div>
                          <!-- 二层 -->
                          <div v-for="(self,key) in item.two">
                            <div class="tit2">{{self.name}}</div>
                            <div class="txt">{{self.con.replace(/@@/g, "\n")}}</div>
                            <div class="table1" v-if="self.tableData">
                              <el-table size="mini"  :data="self.tableData" style="width: 100%">
                                <el-table-column
                                  v-for="column in self.tableColumns"
                                  :key="column.prop"
                                  :prop="column.prop"
                                  :label="column.label">
                                </el-table-column>
                              </el-table>
                            </div>
                            <div class="echartBox" v-if="self.seriesData">
                              <div :id="`echarts${self.echartMsg.echartId}`"  class="echart" ></div>
                            </div>
                            <!-- 3层 -->
                            <div  v-for="(option,num) in self.third">
                              <div class="tit2">{{option.name}}</div>
                              <div class="txt">{{option.con.replace(/@@/g, "\n")}}</div>
                              <div class="table1" v-if="option.tableData">
                                <el-table size="mini"  :data="option.tableData" style="width: 100%">
                                  <el-table-column
                                    v-for="column in option.tableColumns"
                                    :key="column.prop"
                                    :prop="column.prop"
                                    :label="column.label">
                                  </el-table-column>
                                </el-table>
                              </div>
                              <div class="echartBox" v-if="option.seriesData">
                                <div :id="`echarts${option.echartMsg.echartId}`"  class="echart" ></div>
                              </div>
                            </div>

                          </div>
                        </div>
                      </div>
                  </div>
              </el-main>
          </el-container>
      </el-container>
    </div>

    <el-dialog title="筛选" :visible.sync="dialogFormVisible">
      <el-form :model="form" label-width="100px">
        <el-form-item label="合金类型:" >
          <el-select v-model="form.type" clearable  placeholder="请选择">
            <el-option
              v-for="item in typeList"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="化学成分:" >
          <el-select v-model="form.component" clearable  multiple placeholder="请选择">
            <el-option
              v-for="item in componentList"
              :key="item.prop"
              :label="item.label"
              :value="item.prop">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="熔炼工艺:" >
          <el-select v-model="form.craft" clearable  multiple placeholder="请选择">
            <el-option
              v-for="item in craftList"
              :key="item.prop"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="合金密度:" >
          <div class="block sliderBox">
            <el-slider
            v-model="form.region"
            range
            :step="0.02"
            @change="densityChange"
            :min="7"
            :max="10">
          </el-slider>
          </div>
          <el-input disabled v-model="form.regionVal1" @change="regionValChange" style="width: 60px;margin-left: 5px;"></el-input>~
          <el-input disabled v-model="form.regionVal2" @change="regionValChange" style="width: 60px;margin-left: 5px;margin-right: 5px;"></el-input>g/cm³
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">搜索</el-button>
          <el-button @click="dialogFormVisible = false">关闭</el-button>
        </el-form-item>
      </el-form>
      <div class="resBox">
        <el-table
      :data="tableData"
      style="width: 100%">
      <el-table-column
        prop="name"
        label="材料牌号"
        width="180">
      </el-table-column>
      <el-table-column
        prop="name"
        label="材料类型"
        width="180">
      </el-table-column>
      <el-table-column
        prop="address"
        label="材料概述">
      </el-table-column>
      <el-table-column
        label="操作"
        width="120">
        <template slot-scope="scope">
          <el-button
            @click.native.prevent="detailRow(scope.row)"
            type="text"
            size="small">
            详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>
      </div>
      <!-- <div slot="footer" class="dialog-footer">

      </div> -->

    </el-dialog>

  </div>
</template>

<script>
import * as echarts from "echarts";
import * as XLSX from 'xlsx';
import smallNav from "../../components/smallNav/smallNav";
import BackProfile from '../../components/BackProfile/index.vue'
import { getJson } from '@/api/database/dataStretch.js'
import axios from 'axios';
export default {
  components: { smallNav,BackProfile },
  created() {
    this.getMsg('http://www.ai4matter.com/json/GH1015.json');
    // this.getMsg('http://localhost:8100/json/GH1015.json');
    this.getMenu()
  },
  mounted() {


  },
  data() {
    return {
      menuData:[],
      tableList:[],
      tableData:[],
      jsonData:[],
      name1:"固溶强化型变形高温合金",
      name2:"GH1015",
      defaultActive: "1-1",
      select:0,
      activeName:"0",
      introduce:[],//合金介绍
      physicalChemistry:{},//物理弹性和化学
      mechanical:{},//力学
      craft:{},//工艺
      myChart1:null,
      searchValue:"",
      dialogFormVisible: false,
      form: {
        region:[7.5,8.0],
        regionVal1:75,
        regionVal2:80,
        component:[],
        craft:[],
        type:0,
      },
      componentList:[{"label":"C","prop":"C"},{"label":"Cr","prop":"Cr"},{"label":"Ni","prop":"Ni"},{"label":"W","prop":"W"},{"label":"Mo","prop":"Mo"},{"label":"Fe","prop":"Fe"},{"label":"Nb","prop":"Nb"},{"label":"B","prop":"B"},{"label":"Ce","prop":"Ce"},{"label":"Mn","prop":"Mn"},{"label":"Si","prop":"Si"},{"label":"P","prop":"P"},{"label":"S","prop":"S"},{"label":"Cu","prop":"Cu"},{"label":"V","prop":"V"},{"label":"N","prop":"N"},{"label":"Al","prop":"Al"},{"label":"Ti","prop":"Ti"},{"label":"Co","prop":"Co"},{"label":"Sn","prop":"Sn"},{"label":"Pb","prop":"Pb"},{"label":"Zr","prop":"Zr"},{"label":"La","prop":"La"},{"label":"Sb","prop":"Sb"},{"label":"As","prop":"As"},{"label":"Bi","prop":"Bi"},{"label":"Ta","prop":"Ta"},{"label":"Se","prop":"Se"},{"label":"Ag","prop":"Ag"},{"label":"Mg","prop":"Mg"},{"label":"Hf","prop":"Hf"},{"label":"Ga","prop":"Ga"},{"label":"In","prop":"In"},{"label":"Te","prop":"Te"},{"label":"Tl","prop":"Tl"},{"label":"Zn","prop":"Zn"},{"label":"Cd","prop":"Cd"}],
      craftList:[
      {"label":"电弧炉","value":1},
      {"label":"电渣重熔","value":2},
      {"label":"真空电弧重熔","value":3},
      {"label":"非真空感应炉","value":4},
      {"label":"真空感应炉","value":5},
      {"label":"真空双联熔炼","value":6},
      {"label":"电弧炉+真空自耗重熔","value":7},
      {"label":"电弧炉+电渣重熔","value":8},
      {"label":"电弧炉+真空电弧重熔","value":9},
      {"label":"非真空感应炉+真空电弧重熔","value":10},
      {"label":"非真空感应炉+电渣重熔","value":11},
      {"label":"非真空感应炉+真空自耗","value":12},
      {"label":"真空感应炉+电渣重熔","value":13},
      {"label":"真空感应炉+真空自耗","value":14}

    ],
      typeList:[ {"label":"请选择","value":0},{"label":"固溶强化型变形高温合金","value":1},
      {"label":"等轴晶铸造高温合金","value":2},
      {"label":"定向凝固柱晶高温合金","value":3},
      ],
    };
  },
  methods: {
    //生成menu
    menuFun(){
      let menuD=[];
        // let keyList=["GH2135","GH2136","GH2150","GH2150A","GH2302","GH2328","GH2696","GH2706","GH2747","GH2761",
        // "GH2787","GH2901","GH2903","GH2907","GH2909","GH2984","GH4033","GH4037","GH4049","GH4079",
        // "GH4080A","GH4090","GH4093","GH4098","GH4099","GH4105","GH4133","GH4137","GH4141","GH4145",
        // "GH4163","GH4169","GH4199","GH4202","GH4220","GH4413","GH4500","GH4586","GH4648","GH4698",
        // "GH4708","GH4710","GH4720Li","GH4738","GH4742","GH6159","GH6783",]
        // let keyList=["K480","K487","K4002","K4130","K4163","K4169","K4202","K4208","K4222","K4242",
        // "K4537","K4648","K4708","K4951","K640","K640S","K644","K6509","K825",
        // ]
        //let keyList=["DZ404","DZ405","DZ406","DZ408","DZ411","DZ417G","DZ422","DZ422B","DZ438G","DZ468","DZ4125","DZ4125L","DZ4951","DZ640M"]
        // let keyList=["DD402","DD403","DD404","DD406","DD407","DD408","DD426","DD432","DD499"]
        let keyList=["FGH4095","FGH4096","FGH4097"]
        // keyList.some((item)=>{
        //   console.log(item)
        //   menuData.push({"index":"3-33","name":"GH2130","key_component":[],"key_craft":[],"key_density":0})
        // })
        for(let i=0;i<keyList.length;i++){
          let url= "http://localhost:8100/json/"+keyList[i]+".json"
          let num=0;
          getJson(url).then(data => {
            console.log(data.physicalChemistry[7].con)
            let str = data.physicalChemistry[7].con
            let start = str.indexOf("ρ=") + 2;
            let end = str.indexOf("g/", start);
            num = Number(str.substring(start, end));
            console.log(i)
            console.log(num)
            menuD.push({"index":"6-"+(i+73),"name":keyList[i],"key_component":[],"key_craft":[],"key_density":num})
          })
        }
        setTimeout(()=>{
          console.log(menuD)
        },5000)

    },
    searchFun(){
      console.log(this.menuData)
      if(this.searchValue==""){
        return
      }
      this.menuData.some((item,index)=>{
        item.list.some((self,key)=>{
          this.tableList.push(self)
          if(self.name.indexOf(this.searchValue)>-1){
            this.defaultActive=self.index
            this.changeFun(item.name,self)
          }

        })
      })

    },
    onSubmit(){
      let filterkeys= {
        type:this.form.type,
        component:this.form.component,
        craft:this.form.craft,
        region:this.form.region,
      }
      let arr = this.tableList;
      console.log(arr)
      // 通过遍历key值来循环处理
      Object.keys(filterkeys).forEach(key => {
        arr = this.filterFunc(filterkeys[key], key, arr);
      });
      // 为表格赋值
      this.tableData = arr
      console.log(this.tableData)
    },

    //条件筛选
    /**
     * 过滤函数
     * @param {*} val 输入框的值
     * @param {*} key 过滤的字段
     * @param {*} arr 要过滤的数组
     */
    filterFunc(val, key, arr) {
      // if (!val) return arr;
      console.log(val)
      return arr.filter(item => {
        if (key === 'type') {
          let arr=item.index.split("-")
          let typeStr=arr[0]
          if(val==0){
            return item;
          }else if(typeStr==val){
            return item;
          }

        } else if (key === 'component') {
              if(val.length==0){
                return item;
              }else if(this.containsArray(item.key_component, val)){
                return item;
              }

          // return item[key][0] >= val[0] && item[key][1] <= val[1];
        }else if(key === 'craft'){
          if(val.length==0){
            return item;
          }else if(this.containsArray(item.key_craft, val)){
            return item;
          }
        }else if(key === 'region'){
          if(Number(val[0])<=item.key_density && Number(val[1])>=item.key_density){
            return item;
          }
        } else {
          return item
        }
      });
    },
    containsArray(arrA, arrB) {
      return arrB.every(element => arrA.includes(element));
    },
    detailRow(data){
      console.log(data)
      this.defaultActive=data.index
      this.changeFun(data.name,data)
      this.dialogFormVisible = false
    },
    searchMoreFun(){
      this.dialogFormVisible=true;
      this.tableData=[]
    },
    densityChange(){
      console.log(this.form.region)
      this.form.regionVal1=this.form.region[0]
      this.form.regionVal2=this.form.region[1]

    },
    regionValChange(){
      console.log("regionVal1改变")
      this.form.region[0]=Number(this.form.regionVal1)
      this.form.region[1]=Number(this.form.regionVal2)
      console.log(this.form.region)
    },
    tabClick(data){

      if(this.activeName==0){
        this.introduce=this.jsonData.introduce;
      }else if(this.activeName==1){
        this.introduce=this.jsonData.physicalChemistry;
      }else if(this.activeName==2){
        this.introduce=this.jsonData.mechanical;
      }else if(this.activeName==3){
        this.introduce=this.jsonData.craft;
      }else if(this.activeName==4){
        this.introduce=this.jsonData.microstructures;
      }

      this.drawFun()

    },
    changeFun(name,data){
      this.activeName="0"
      console.log(data)
      this.name1=name;
      this.name2=data.name
      this.defaultActive=data.index
      let getJsonUrl="http://www.ai4matter.com/json/"+data.name+".json"
      // let getJsonUrl="http://localhost:8100/json/"+data.name+".json"
      this.getMsg(getJsonUrl)
    },
    URLFun(){
      let appid="wwc9ac26396fb5c045";
      let code="code";
      let redirect_uri=encodeURIComponent("http://www.ai4matter.com/");
      let scope="snsapi_privateinfo";
      let agentid="1000002";


     let str="https://open.weixin.qq.com/connect/oauth2/authorize?appid="+appid+"&agentid="+agentid+"&redirect_uri="+redirect_uri+"&response_type="+code+"&scope="+scope+"&state=#wechat_redirect"
      console.log(str)
    },
    //获所有成分
    getComponent(){
      let arr=[]
      this.menu.some((item,index)=>{
        item.list.some((self,key)=>{
          // arr= new Set(arr.concat(self.key_component))
          arr=arr.concat(self.key_component)
        })
      })
      let arr2 =Array.from(new Set(arr))
      let arr3=[]
      for(let i=0;i<arr2.length;i++){
        arr3.push({ "label": arr2[i], "prop": arr2[i] })
      }
      console.log(arr3 )
    },

    //获取元素
    getysFun(){
      let url= "http://localhost:8100/json/K423.json"
      let list=[]
      let componentList=[]
      getJson(url).then(data => {
        console.log(data.introduce)
        data.introduce[6].tableColumns.some((item,index)=>{
          if(index!=0){
            componentList.push(item.label)
          }

        })
        console.log(componentList)
        // let str="采用非真空感应炉+电渣重熔、或电弧炉+电渣重熔熔炼工艺。"
        // let str=data.introduce[5].con
        // let str1=str.substring(2,str.length-5)
        // let arr=str1.split('、或');
        // console.log(arr)
        //   arr.some((item,index)=>{
        //     this.craftList.some((self,key)=>{
        //       if(item==self.label){
        //         console.log(self.value)
        //         list.push(self.value)
        //       }
        //     })
        //   })
        //   console.log(list)

      })

    },

    //json对象生成
    async asJson(){
      const response = await axios.get('/json/source/19_K423.xlsx', { responseType: 'arraybuffer' });
      const data = new Uint8Array(response.data);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetNames = workbook.SheetNames;
      console.log(sheetNames)

      const response2 = await axios.get('/json/source/图形数据19_K423.xlsx', { responseType: 'arraybuffer' });
      const data2 = new Uint8Array(response2.data);
      const workbook2 = XLSX.read(data2, { type: 'array' });
      const sheetNames2 = workbook2.SheetNames;
      console.log(sheetNames2)

       //获取table数据
      let url= "http://localhost:8100/json/source/19_K423.json"
      getJson(url).then(data => {
          //table处理
          sheetNames.some((self)=>{
            Object.keys(data).forEach(key => {
              // console.log(data[key]);
              data[key].some((item)=>{
                // console.log(item)
                 //sheet和json数据匹配
                 let newString1=item.name.indexOf('、');
                 let newString2=item.name.substring(0,newString1);
                //  console.log(newString2)
                if(newString2==self){
                  let worksheet = workbook.Sheets[self];
                  // 将工作表转换为JSON
                  let jsonData = XLSX.utils.sheet_to_json(worksheet);
                  // console.log(jsonData)
                  // 表格数据处理
                  let tableColumns=[]
                  jsonData.some((item_1,index)=>{
                    for(let key_1 in item_1) {
                      // console.log(key_1)
                      if(index==0){
                        tableColumns.push({ "label": key_1, "prop": key_1 })
                      }
                    }
                  })
                  item.tableData=jsonData;
                  item.tableColumns=tableColumns

                }
                //二层处理
                if(item.two){
                  item.two.some((itemTwo)=>{
                    // console.log(itemTwo)
                    let newString1=itemTwo.name.indexOf('、');
                    let newString2=itemTwo.name.substring(0,newString1);
                    if(newString2==self){
                      let worksheet = workbook.Sheets[self];
                      // 将工作表转换为JSON
                      let jsonData = XLSX.utils.sheet_to_json(worksheet);
                      // console.log(jsonData)
                      // 表格数据处理
                      let tableColumns=[]
                      jsonData.some((item_1,index)=>{
                        for(let key_1 in item_1) {
                          // console.log(key_1)
                          if(index==0){
                            tableColumns.push({ "label": key_1, "prop": key_1 })
                          }
                        }
                      })
                      itemTwo.tableData=jsonData;
                      itemTwo.tableColumns=tableColumns

                    }
                    // console.log(itemTwo.name)
                    //3层处理
                    if(itemTwo.third){
                      itemTwo.third.some((itemThird)=>{
                        //console.log(itemThird)
                        let newString1=itemThird.name.indexOf('、');
                        let newString2=itemThird.name.substring(0,newString1);
                        if(newString2==self){
                          let worksheet = workbook.Sheets[self];
                          // 将工作表转换为JSON
                          let jsonData = XLSX.utils.sheet_to_json(worksheet);
                          // console.log(jsonData)
                          // 表格数据处理
                          let tableColumns=[]
                          jsonData.some((item_1,index)=>{
                            for(let key_1 in item_1) {
                              // console.log(key_1)
                              if(index==0){
                                tableColumns.push({ "label": key_1, "prop": key_1 })
                              }
                            }
                          })
                          itemThird.tableData=jsonData;
                          itemThird.tableColumns=tableColumns

                        }
                      })
                    }
                  })
                }
              })
            });
          })


          //图表处理
          sheetNames2.some((self)=>{
            Object.keys(data).forEach(key => {
              data[key].some((item)=>{
                let newString1=item.name.indexOf('、');
                let newString2=item.name.substring(0,newString1);
                let endStr=item.name.indexOf('见')>0? item.name.indexOf('见'):item.name.length

                let name =item.name.substring(newString1+1,endStr);
                let echartId=newString2.split('.').join('')
                if(newString2==self){
                  let worksheet = workbook2.Sheets[self];
                  let jsonData = XLSX.utils.sheet_to_json(worksheet);
                  let seriesData = this.tubiao(jsonData,name)
                  //横纵坐标问题待解决单位
                  item.xAxisData=[],
                  item.echartMsg= {
                                "echartId":echartId,
                                "xName":"",
                                "yName":"",
                                "minX": seriesData[0],
                                "minY":seriesData[1]
                            }
                  item.seriesData=seriesData[2]
                }
                 //二层处理
                if(item.two){
                  item.two.some((itemTwo)=>{
                    let newString1=itemTwo.name.indexOf('、');
                    let newString2=itemTwo.name.substring(0,newString1);
                    let endStr=itemTwo.name.indexOf('见')>0? itemTwo.name.indexOf('见'):itemTwo.name.length
                    let name =itemTwo.name.substring(newString1+1,endStr);
                    let echartId=newString2.split('.').join('')
                    if(newString2==self){
                      let worksheet = workbook2.Sheets[self];
                      let jsonData = XLSX.utils.sheet_to_json(worksheet);
                      let seriesData = this.tubiao(jsonData,name)
                      //横纵坐标问题待解决
                      itemTwo.xAxisData=[],
                      itemTwo.echartMsg= {
                                    "echartId":echartId,
                                    "xName":"",
                                    "yName":"",
                                    "minX": seriesData[0],
                                    "minY":seriesData[1]
                                }
                      itemTwo.seriesData=seriesData[2]
                    }
                    if(itemTwo.third){
                      itemTwo.third.some((itemThird)=>{
                        let newString1=itemThird.name.indexOf('、');
                        let newString2=itemThird.name.substring(0,newString1);
                        let endStr=itemThird.name.indexOf('见')>0? itemThird.name.indexOf('见'):itemThird.name.length
                        let name =itemThird.name.substring(newString1+1,endStr);
                        // let name =itemTwo.name.substring(newString1+1,itemThird.name.length);
                        let echartId=newString2.split('.').join('')
                        if(newString2==self){
                          let worksheet = workbook2.Sheets[self];
                          let jsonData = XLSX.utils.sheet_to_json(worksheet);
                          let seriesData = this.tubiao(jsonData,name)
                          //横纵坐标问题待解决
                          itemThird.xAxisData=[],
                          itemThird.echartMsg= {
                                        "echartId":echartId,
                                        "xName":"",
                                        "yName":"",
                                        "minX": seriesData[0],
                                        "minY":seriesData[1]
                                    }
                          itemThird.seriesData=seriesData[2]
                        }
                      })
                    }

                  })
                }
              })
            })
          })
         console.log(data)



      })
    },

    tubiao(jsonData,lineName){
      // console.log(jsonData)
      let keyList=[]
        // let arr=[]
        jsonData.some((item,index)=>{
          for(let key in item) {
            if(index==1){
              // let str=key.slice(0, 7)
              keyList.push(key)
            }
            // arr.push(item[key])
          }

        })
        let newList = Array.from(new Set(keyList))
        // console.log(arr);
        let seriesData=[]
        keyList.some((item,index)=>{
          console.log(item)
          let nameStr=""
          //         if(item.indexOf("-")>0){
          //   if(item.split('-').length>2){
          //     nameStr=item.split('-')[0]+item.split('-')[1]
          //     seriesData.push({"name":nameStr,"type":"line","smooth":"smooth","data":[]})
          //   }else{
          //     nameStr=item.split('-')[0]
          //     seriesData.push({"name":nameStr,"type":"line","smooth":"smooth","data":[]})
          //   }

          // }else
          if(item.indexOf("_")>0){
              nameStr=item.split('_')[0]
              seriesData.push({"name":nameStr,"type":"line","smooth":"smooth","data":[]})
          }else{
            seriesData.push({"name":lineName+index,"type":"line","smooth":"smooth","data":[]})
          }

          jsonData.some((self,num)=>{
            for(let key in self) {
               if(item==key){
                seriesData[index].data.push([self[key]])
               }
            }
          })
        })
        let Data=[]
        seriesData.some((item,index)=>{
          if(index%2==0){
            item.data.some((self,num)=>{
              self[0]=self[0].toFixed(4)
              self.push(seriesData[index+1].data[num][0].toFixed(4))
            })
            Data.push(item)
          }

        })

        let xArr=[],yArr=[]
        Data.some((self,key)=>{
          Data[key].data.some((item)=>{
            xArr.push(item[0]);
            yArr.push(item[1]);
        })
        })
        let xmin=Math.min(...xArr)
        let ymin=Math.min(...yArr)
        console.log("xmin:"+xmin)
        console.log("ymin:"+ymin)

        //return Data []
        return [xmin,ymin,Data]

    },



    async readFile() {
      try {
        const response = await axios.get('/json/2_GH1016.xlsx', { responseType: 'arraybuffer' });
        const data = new Uint8Array(response.data);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetNames = workbook.SheetNames;
        console.log(sheetNames)
        // 获取第一个工作表
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];

        // 将工作表转换为JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        console.log(jsonData)
        // 表格数据处理
        let tableColumns=[]
        jsonData.some((item,index)=>{
          for(let key in item) {
            // console.log(key)
            if(index==0){
              tableColumns.push({ "label": key, "prop": key })
            }
          }
        })

        // jsonData.some((item,index)=>{
        //   for(let key in item) {
        //     console.log(key)
        //     if(index==0){
        //       tableColumns.push({ "label": key, "prop": key })
        //     }
        //   }
        // })

        // console.log(tableColumns)

        // 图数据处理
        // let keyList=[]
        // let arr=[]
        // jsonData.some((item,index)=>{
        //   for(let key in item) {
        //     if(index==1){
        //       // let str=key.slice(0, 7)
        //       keyList.push(key)
        //     }
        //     arr.push(item[key])
        //   }

        // })
        // let newList = Array.from(new Set(keyList))
        // console.log(newList);
        // let seriesData=[]
        // keyList.some((item,index)=>{
        //   seriesData.push({"name":item,"type":"line","smooth":"smooth","data":[]})
        //   jsonData.some((self,num)=>{
        //     for(let key in self) {
        //        if(item==key){
        //         seriesData[index].data.push([self[key]])
        //        }
        //     }
        //   })
        // })
        // let Data=[]
        // seriesData.some((item,index)=>{
        //   if(index%2==0){
        //     item.data.some((self,num)=>{
        //       self.push(seriesData[index+1].data[num][0])
        //     })
        //     Data.push(item)

        //   }
        // })
        // console.log(Data)

      } catch (error) {
        console.error('读取文件时发生错误:', error);
      }
    },
    getMenu(){
      // let getJsonUrl="http://localhost:8100/json/menu.json"
      let getJsonUrl="http://www.ai4matter.com/json/menu.json"
        getJson(getJsonUrl).then(data => {
                console.log(data)
            this.menuData=data.menu
            this.menuData.some((item,index)=>{
              item.list.some((self,key)=>{
                this.tableList.push(self)
              })
            })
          })
    },
    //图表绘制
    drawFun(){
            setTimeout(() => {
              this.introduce.some((item,index)=>{
                  if(item.seriesData){
                    let chartObj=this.$echarts.init(document.getElementById("echarts"+item.echartMsg.echartId));
                    this.initChart1(chartObj,item.xAxisData,item.seriesData,item.echartMsg)
                  }
                  if(item.two){
                    item.two.some((self,key)=>{
                      if(self.seriesData){
                        let chartObj=this.$echarts.init(document.getElementById("echarts"+self.echartMsg.echartId));
                        this.initChart1(chartObj,self.xAxisData,self.seriesData,self.echartMsg)
                      }
                      if(self.third){
                        self.third.some((option,key)=>{
                        if(option.seriesData){
                          let chartObj=this.$echarts.init(document.getElementById("echarts"+option.echartMsg.echartId));
                          this.initChart1(chartObj,option.xAxisData,option.seriesData,option.echartMsg)
                        }
                      })
                      }
                  })
                }
            })
          }, 100);
    },
    getMsg(getJsonUrl){
      // let getJsonUrl="http://192.168.19.126:8100/json/GH1015.json"
        getJson(getJsonUrl).then(data => {
                this.jsonData=data
                this.introduce=data.introduce;
                // this.physicalChemistry=data.physicalChemistry;
                // this.mechanical=data.mechanical;
                // this.craft=data.craft
                this.drawFun()
            })
    },
    // 线性图
    initChart1(Chart,xAxisData,seriesData,echartMsg) {
      const _this = this;
      // 指定图表的配置项和数据
      let option = {
        color:['#43b1fd','#1bddb5','#fe708d','#e7e734','#1fdaeb','#cf48c9','#ffb129','#1b11fe'],
        tooltip: {
          trigger: "axis",
        },
        grid: {
          top: "14%",
          left: "5%",
          right: "17%",
          bottom: "8%",
          containLabel: true,
        },
        legend: {
          top: "5%",
          orient: "horizontal",
          right: 100,
          left:100,
          icon: "rect",
          itemWidth: 10,
          itemHeight: 10,
          textStyle: {
            fontSize: 10
          }
        },
        xAxis: [
          {
            // type: "category",
            name: echartMsg.xName,
            type: "value",
            // 坐标居中关键
            boundaryGap: false,
            axisLabel: {
              color: "rgba(0, 0, 0, 1)",
              fontSize: 14,
            },
            axisLine: {
              //坐标轴x轴线相关设置
              show: true,
            },
            min:Math.floor(echartMsg.minX),
            axisTick: {
              show: false,
            },
            data: xAxisData,
          },
        ],
        yAxis: [
          {
            // type: "category",
            type: "value",
            name: echartMsg.yName,
            // name: "W/(m·K)",
            nameGap: 10,
            nameTextStyle: {
              fontSize: 14,
              color: "#000",
              padding: [0, 0, 0, 10],
            },
            // minInterval: 1,
            min:Math.floor(echartMsg.minY),
            // splitNumber: 7,
            axisLabel: {
              color: "rgba(0, 0, 0, 1)",
              fontSize: 14,
            },
            splitLine: {
              show: false,
            },
            axisLine: {
              show: true
            },
          },
        ],
        series:seriesData
      };
      if(Chart){
        Chart.clear();
      }
      // 使用刚指定的配置项和数据显示图表。
      Chart.setOption(option,true);
      // window.addEventListener('resize', function () {
      //   if(document.getElementById('echartBox1')){
      //     _this.chartssize(document.getElementById('echartBox1'),document.getElementById('echarts1'));
      //     _this.myChart1.resize()
      //   }
      // });
    },
  },
};
</script>
<style>
.el-form-item__content{
  display: flex;
}
.el-form  .el-select .el-input__inner{
  width: 300px;
}

</style>
<style scoped>

.data-serach {
  width: 100%;
  min-height: 100%;
  height: auto;
  position: relative;
  background-color: #edeff9;
}
.con{
    position: absolute;
    top: calc(5vh + 50px);
    left: 50%;
    -webkit-transform: translateX(-50%);
    transform: translateX(-50%);
    margin: 0 auto;
    width: 90vw;
}
.el-main{
  background-color: #fff;
}
.el-aside{
  padding:0;
  margin:0;
  background:#fff;
  border-right: 1px solid #e6e6e6;
  overflow: hidden;

}
.el-menu{
  height: calc(100% - 80px);
  overflow: auto;
}
.content{
  margin-top: 20px;
  box-sizing: border-box;
}
.content .nr{
  height: 73vh;
  overflow-y: auto;
}
.content .nr .tit1{
  font-size: 16px;
  font-weight: bold;
  margin:10px 0
}
.content .nr .tit2{
  font-size: 14px;
  font-weight: bold;
  margin:6px 0
}
.content .nr .txt{
  padding-left: 2em;
  font-size: 14px;
  white-space: pre-wrap;
  /* text-indent: 2em; */
  line-height: 28px;
  color:#333
}
.echart{
  width: 850px;
  height:300px;
}
.table1{
  width: 95%;
  margin:0 auto 20px;
}
.search_box{
  padding: 20px;
}
.sliderBox{
  width: 600px;
}

</style>

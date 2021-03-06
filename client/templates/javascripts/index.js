"use strict";
import '../stylesheets/style.min.css';
// import './router';
import axios from 'axios';
import qs from 'qs';
import '@vant/touch-emulator';
import areaList from './area';

const URLs = `https://admin.api.zgksx.com/`;

// const pathLogin = "http://192.168.0.168:8080/cafeadmin/src/dist/";
// const toPath = window.navigator.userAgent.toLowerCase().match(/MicroMessenger/i) != 'micromessenger' 
// ? location.href 
// : "http://192.168.0.168:8080/cafeadmin/client/templates/build/index.html";

const pathLogin = "http://zgksx.com/por/admin/";
const toPath = window.navigator.userAgent.toLowerCase().match(/MicroMessenger/i) != 'micromessenger' 
? location.href 
: "http://zgksx.com/por/dz/index.html";

const URLFiles = `https://file.zgksx.com/`;
const wxUri = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx998479db1176209a&redirect_uri=
                ${ process.env.NODE_ENV == "development" ? "http://zgksx.com/por/anchor/" : location.href.split('?')[0]}
                &response_type=code&scope=snsapi_userinfo&state=
                ${ process.env.NODE_ENV == "development" ? location.href.split('?')[0] : null}
                #wechat_redirect`.replace(/ /g, '');

axios.defaults.baseURL = URLs;
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
axios.defaults.crossDomain = true;
// axios.defaults.withCredentials = true;  //设置cross跨域 并设置访问权限 允许跨域携带cookie信息
axios.defaults.headers.common['Authorization'] = sessionStorage.getItem('token') ? JSON.parse(sessionStorage.getItem('token')).asset.secret : ''; // 设置请求头为 Authorization
//配置发送请求前的拦截器 可以设置token信息 
axios.interceptors.request.use(
    config => {
        // 在发送请求之前做什么
        if (config.method === "post") {
        } else {
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    })
axios.interceptors.response.use(
    response => {
        if (response.status === 200) {
            setTimeout(() => {
                if (/未登录/.test(response.data.msg)) {
                    // location.href = location.href.replace(location.href.substring(location.href.lastIndexOf('/')), '/index.html');
                    location.href = `${pathLogin}login.htm?outch_wx=${toPath}`;
                };
            }, 1000)
            return Promise.resolve(response);
        } else {
            return Promise.reject(response);
        }
    },
    error => {
        console.log(error)
        return Promise.reject(error.response);
    }
)
if (!Object.values) Object.values = function (obj) {  //对于 object values 的支持
    if (obj !== Object(obj))
        throw new TypeError('Object.values called on a non-object');
    var val = [], key;
    for (key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            val.push(obj[key]);
        }
    }
    return val;
}

window.onload = function (params) {
    setTimeout(() => {
        try {
             new Vue({
                el: '#app',
                data: {
                    active: /order/.test(location.href) ? 1 : /user/.test(location.href) ? 2 : 0,
                    username: '',
                    password: '',
                    phone: '',
                    oldpwd: '',
                    image: '../images/banner.png',
                    detailsImages: '../images/details.png',
                    contentMsg: false,
                    items: [],
                    activeId: 1,
                    activeIndex: 0,
                    tag: 0,
                    num: sessionStorage.getItem('num') || 1,
                    machineList: [],
                    machine: {
                        machineName: '选择服务'
                    },
                    list: [],
                    loading: false,
                    finished: false,
                    refreshing: false,
                    fileList: [],
                    fileLists: [],
                    fileListss: [],
                    fileImages: [],
                    handling: false,
                    loadingShow: false,
                    show: true,
                    workList: {},
                    logs: [],
                    alias: new Map([
                        ['workId', '工单号'],
                        ['exName', '需求信息'],  // 断点 分层
                        ['demandChargeName', '需求名称'],
                        ['repairsTypeName', '报修类型名称'],
                        ['products', '产品名称'],  // 新增
                        ['faultContent', '故障描述'],
                        ['video', '视频附件'],  //新增
                        ['shopNames', '门店信息'],  // 断点 分层
                        ['shopName', '门店名称'],
                        ['contactNames', '联系人信息'],  // 断点 分层
                        ['contactName', '联系人名称'],
                        ['contactPhone', '联系人电话'],
                        ['maintainerNames', '师傅信息'],  // 断点 分层
                        ['maintainerName', '维修师傅'],
                        ['maintainerPhone', '维修师傅电话'],
                        ['orderName', '订单信息'],  // 断点 分层
                        ['createTime', '创建时间'],
                        ['creationType', '创建类型'],
                        ['nickName', '微信昵称'],
                        ['maintainPaymentStr', '维修金额'],
                        ['machineName', '设备名称'],
                        ['visitCostStr', '预支付费用'],
                        ['partPaymentStr', '配件费用'],
                        ['province', '省'],
                        ['city', '市'],
                        ['district', '区'],
                        ['address', '详细地址'],
                        ['status', '状态'],
                    ]),
                    creationType: new Map([
                        [1, '手动提交(管理端)'],
                        [2, '个人用户提交(小程序)'],
                        [3, '企业用户提交(公众号)']
                    ]),
                    status: new Map([
                        [1, '待沟通'],
                        [2, '待派单'],
                        [3, '已派单'],
                        [4, '已完成'],
                        [18, '已提交'],
                        [19, '已取消']
                    ]),
                    search: "",  //工单列表的查询字段
                    secrHeight: `height:${window.innerHeight - 151}px;overflow: auto;`,  //工单内容高度
                    video: false,  // 是否预览视频
                    videoFile: "",
                    projects: [], //产品数组
                    bottomFooter: `bottom: 0px`,
                    minDate: new Date(2020, 0, 1),
                    maxDate: new Date(2030, 10, 1),
                    currentDate: new Date(),
                    timeMsg: false,
                    areaList,
                    addressMsg: false,
                    formData:{
                        shopName: '',
                        contactName: '',
                        contactPhone: '',
                        citys: '',
                        address: ''
                    },
                    currentPage: sessionStorage.getItem('num') || 1,
                    total: 0,
                    workIdLogs: '',
                    date: '',
                    dataShow: false,
                    minDate: new Date(2010, 0, 1),
                    maxDate: new Date(2030, 0, 31),
                    formDate: ''
                },
                created: function () {
                    this.loadingShow = true;
                    let _arr_ = [];
                    if (/content/.test(location.href)) {
                        this.containers();
                        // this.thisPosition();
                        axios.get('wechat_machine_list')  //查看设备列表
                            .then(params => {
                                setTimeout(() => {
                                    this.show = false;
                                    this.loadingShow = false;
                                }, 1000)
                                if (params.data.state == 200) {
                                    axios.post('sys_repairs_type_list', qs.stringify({  //查看报修分类列表
                                        page: 1,
                                        pageSize: 20
                                    }))
                                        .then(res => {
                                            if (res.data.state == 200) {
                                                params.data.list.map((item, index) => {
                                                    _arr_.push({ text: item.machineName })
                                                    _arr_[index]['children'] = [];
                                                    res.data.page.records.forEach(element => {
                                                        _arr_[index]['children'].push({
                                                            text: element.repairsTypeName,
                                                            id: element.repairsTypeId,
                                                            parentId: item.machineId,
                                                            parentName: item.machineName
                                                        })
                                                    })
                                                })
                                                this.items = _arr_;
                                            } else {
                                                vat.Toast(params.data.msg)
                                            };
                                        });
                                } else {
                                    vant.Toast(params.data.msg)
                                };
                            }).catch((error) => {
                                console.info(error)
                                this.loadingShow = false;
                                vant.Toast('发生错误' + JSON.stringify(error))
                            })
                            // 2020-07-29 更新 如果是追加工单 则执行以下操作
                            /**
                             * path: 查询上一层的订单信息
                             * auth: 生成新的捆绑上一工单的订单
                             * **/
                            if(this.getQueryString('workId')){
                                axios.get('sys_work_detail?workId=' + this.getQueryString('workId')).then(params => {
                                    if (params.data.state == 200) {
                                        this.machine = {
                                            machineId: params.data.data.machineId,
                                            repairsTypeId: params.data.data.repairsTypeId,
                                            machineName: params.data.data.machineName + '>' + params.data.data.repairsTypeName
                                        };
                                        this.formData.shopName = params.data.data.shopName;
                                        this.formData.contactName = params.data.data.contactName;
                                        this.formData.contactPhone = params.data.data.contactPhone;
                                        try {
                                            JSON.parse(params.data.data.facilityName).forEach(element => {  //处理还未更改过的产品依然是JSON数组状态
                                                this.projects.push({
                                                    name: element
                                                })
                                            })
                                        } catch (error) {
                                            if(params.data.data.facilityName != -1){  //存在修改过的产品
                                                params.data.data.facilityName.split(',').forEach(element => {
                                                    this.projects.push({
                                                        name: element
                                                    })
                                                })
                                            }else{
                                                this.projects = [];
                                            }
                                        }
                                        this.formData.citys = params.data.data.province && params.data.data.province != -1? params.data.data.province+','+params.data.data.city+','+params.data.data.district:'';
                                        this.formData.address = params.data.data.address != -1 ? params.data.data.address: '';

                                        try {
                                            if(params.data.data.faultDiagram != -1){
                                                params.data.data.faultDiagram.split(',').forEach(element =>{
                                                    this.fileList.push({
                                                        url: element
                                                    });
                                                    this.fileImages.push({ url: element, isImage: { key: "faultDiagram", localName: element } });
                                                })
                                            }
                                            
                                            // params.data.data.machineBrandPic.split(',').forEach(element =>{
                                            //     this.fileList.push({
                                            //         url: element
                                            //     });
                                            //     this.fileImages.push({ url: element, isImage: { key: "machineBrandPic", localName: element } });
                                            // })
                                            params.data.data.machineOverallPic.split(',').forEach(element =>{
                                                this.fileLists.push({
                                                    url: element
                                                })
                                                this.fileImages.push({ url: element, isImage: { key: "machineOverallPic", localName: element } });
                                            })
                                            params.data.data.faultPartPic.split(',').forEach(element =>{
                                                this.fileListss.push({
                                                    url: element
                                                })
                                                this.fileImages.push({ url: element, isImage: { key: "faultPartPic", localName: element } });
                                            })
                                        } catch (error) {
                                            //
                                        }
                                        // // this.visitingTime = params.data.data.visitingTime;
                                        // // this.faultContent = params.data.data.faultContent;
                                         if(params.data.data.video != -1){
                                            this.videoFile = params.data.data.video;
                                            this.video = true;
                                         };
                                    } else {
                                        vant.Toast('获取上一订单数据失败');
                                    }
                                })
                            }
                            
                    } else if (/order/.test(location.href)) {
                        this.containers();
                        this.thisPosition();
                        this.onLoad();
                    } else if (/user/.test(location.href)) {
                        this.containers();
                        this.thisPosition();
                        axios.get('sys_admin_detail').then(params => {
                            setTimeout(() => {
                                this.show = false;
                                this.loadingShow = false;
                            }, 1000)
                            if (params.data.state == 200) {
                                this.username = params.data.data.adminName;
                                this.phone = params.data.data.phone;
                            } else {
                                vant.Toast(params.data.msg)
                            }
                        })
                    } else if (/details/.test(location.href)) {
                        this.containers();
                        this.detailsMessage();
                    } else if (/logs/.test(location.href)) {
                        this.containers();
                        this.workIdLogs = this.getQueryString('workId')
                        axios.get('work_log_list?workId=' + this.getQueryString('workId')).then(params => {
                            setTimeout(() => {
                                this.show = false;
                                this.loadingShow = false;
                            }, 1000)
                            if (params.data.state == 200) {
                                this.logs = [];
                                this.logs = params.data.list;
                                this.$nextTick(function () {
                                    setTimeout(() => {
                                        document.querySelector('#goBack').onclick = () => {
                                            location.href = './details.html?workId='+ this.getQueryString('workId')
                                        }
                                        document.querySelector('#goBackOrder').onclick = () => {
                                            location.href = './order.html'
                                        }
                                    }, 1000)
                                })
                            } else {
                                // vant.Toast('获取数据异常！请重试');
                                setTimeout(() => {
                                    location.href = './order.html';
                                }, 500)
                            }
                        })
                    } else {
                        setTimeout(() => { this.show = false; }, 1200);
                        this.containers();
                        if (window.navigator.userAgent.toLowerCase().match(/MicroMessenger/i) != 'micromessenger') return false;  // 不是微信浏览器的情况下
                        sessionStorage.getItem('token') ? (() => {
                            // 0 未绑定 1 已绑定
                            if (sessionStorage.getItem('wechatId')) {
                                this.onSubmit({
                                    account: this.decrypt(JSON.parse(sessionStorage.getItem('author')).au),
                                    password: this.decrypt(JSON.parse(sessionStorage.getItem('author')).as)
                                });
                                return false;
                            }
                            location.href = `./content.html`;
                        })() : !/code/g.test(location.href) ? location.href = wxUri : (() => {
                            axios.post('admin_repairs_wechat_login', qs.stringify({
                                code: this.getQueryString("code")
                            }))
                                .then(params => {
                                    if (params.data.state == 200) {
                                        if (params.data.data.hasBind < 1) {
                                            sessionStorage.setItem('wechatId', params.data.data.wechatResult.wechatId);
                                            location.href = `${pathLogin}login.htm?outch_wx=${toPath}`;   // 调用统一登陆页面
                                            return false;
                                        }
                                        params.data.data['secret'] = params.data.data.loginResult.secret;  // 提取层级
                                        sessionStorage.setItem('token', JSON.stringify({asset: params.data.data}));
                                        location.href = `./content.html`;
                                    } else {
                                        if (/code/.test(params.data.msg)) {
                                            vant.Toast('获取的指令已失效！请退出重试');
                                            return false;
                                        }
                                        vant.Toast(params.data.msg);
                                        setTimeout(() => {
                                            location.href = `${pathLogin}login.htm?outch_wx=${toPath}`;
                                        }, 1000);
                                    }
                                }).catch((error) => {
                                    console.info(error)
                                    vant.Toast('发生错误' + JSON.stringify(error))
                                })
                        })();
                    }
                },
                methods: {
                    formatter(type, val) {  // 时间组件过滤器
                        if(type === 'year'){
                            return `${val}年`
                        }else if (type === 'month') {
                            return `${val}月`;
                        } else if (type === 'day') {
                            return `${val}日`;
                        }else if (type === 'hour'){
                            return `${val}时`
                        }else if(type === 'minute'){
                            return `${val}分`
                        }
                        return val;
                    },
                    decrypt: function (_e) {  // 解密字符串
                        _e = unescape(_e);
                        var c = String.fromCharCode(_e.charCodeAt(0) - _e.length);
                        for (var i = 1; i < _e.length; i++) {
                            c += String.fromCharCode(_e.charCodeAt(i) - c.charCodeAt(i - 1));
                        }
                        return c;
                    },
                    containers() {
                        setTimeout(() => {
                            document.querySelector('.container').style.display = 'block';
                        }, 1000)
                    },
                    href(params) {
                        location.href = `./${params}.html?workId=` + this.getQueryString('workId');
                    },
                    thisPosition() {
                        if (!/(iPhone|iPad|iPod|iOS|Android)/i.test(navigator.userAgent)) {
                            setTimeout(() => {
                                this.$nextTick(function () {
                                    document.querySelector('.van-tabbar').style.position = 'absolute';
                                })
                                // 2020-07-28
                                document.querySelector(".center") ?
                                this.bottomFooter = `top: ${document.querySelector(".center").offsetHeight + document.querySelector('.my-swipe').offsetHeight + 100}px`
                                : null;
                            }, 1100)
                        }
                    },
                    getQueryString(n) {
                        var reg = new RegExp("(^|&)" + n + "=([^&]*)(&|$)", "i");
                        var e = window.location.search.substr(1).match(reg);
                        if (e) return unescape(e[2]);
                        return null;
                    },
                    onSelect(params) {
                        this.machine = {
                            machineId: params.parentId,
                            repairsTypeId: params.id,
                            machineName: params.parentName + '>' + params.text || '选择设备'
                        };
                        this.contentMsg = false;
                    },

                    submit() {
                        if(!this.machine.machineId || !this.machine.repairsTypeId ||!this.formData.shopName){
                            vant.Toast('请填写完整信息')
                            return false;
                        }
                        this.handling = true;
                        let pic = {
                            machineBrandPic: [],
                            machineOverallPic: [],
                            faultPartPic: [],
                            faultDiagram: []
                        }
                        if(this.fileImages.length > 0){
                            this.fileImages.forEach(item => {
                                pic[item.isImage.key].push(item.url);
                            })
                        }
                        axios.post('wechat_commit_work', qs.stringify({
                            machineId: this.machine.machineId,
                            repairsTypeId: this.machine.repairsTypeId,
                            shopName: this.formData.shopName,
                            contactName: this.formData.contactName || -1,
                            contactPhone: this.formData.contactPhone || -1,
                            faultContent: this.formData.faultContent || -1,
                            parentId: this.getQueryString('workId') || -1, 
                            video: this.videoFile || -1, // 视频文件
                            visitingTime: this.formData.visitingTime || null,// 预计上门时间
                            facilityName: JSON.stringify(this.projects) || -1,// 产品名称
                            faultDiagram: pic.faultDiagram.toString() || -1,
                            province: this.formData.citys ? this.formData.citys.split(',')[0]: -1,
                            district: this.formData.citys ? this.formData.citys.split(',')[2]: -1,
                            city: this.formData.citys ? this.formData.citys.split(',')[1]: -1,
                            address: this.formData.address|| -1,
                        }))
                            .then(params => {
                                setTimeout(() => {
                                    this.handling = false;
                                }, 1000);
                                if (params.data.state == 200) {
                                    vant.Toast(params.data.msg);
                                    location.href = './order.html';
                                } else {
                                    vant.Toast(params.data.msg)
                                };
                            })
                    },
                    
                    /**
                     * path : order
                     * tag: status = 4
                     * **/
                    tryAgain(params){  //再次提交工单
                        location.href = './content.html?workId='+ params;
                    },
                    /**
                     * path : index
                     * tag: wx/pwd login
                     * **/
                    onSubmit(params, bool) {
                        this.handling = true;
                        axios.post('admin_account_login', qs.stringify({
                            account: params.account,
                            password: params.password,
                            wechatId: sessionStorage.getItem('wechatId') || "",
                        }))
                            .then(res => {
                                this.handling = false;
                                sessionStorage.removeItem('token');
                                if (res.data.state == 200) {
                                    sessionStorage.setItem('token', JSON.stringify({asset: res.data.data}));
                                    location.href = './content.html';
                                } else {
                                    sessionStorage.removeItem('wechatId');
                                    !bool ? this.onSubmit(params, true) : null;  // 重启请求
                                    setTimeout(() => {
                                        vant.Toast(res.data.msg)
                                    },1000)
                                };
                            });
                    },

                    preview(params) {
                        vant.ImagePreview(params.split(','))
                    },

                    updataSubmit() {
                        this.handling = true;
                        axios.post('edit_current_admin', qs.stringify({
                            adminName: this.username,
                            phone: this.phone,
                            originPassword: this.oldpwd,
                            password: this.password
                        }))
                            .then(params => {
                                this.handling = false;
                                if (params.data.state == 200) {
                                    localStorage.clear();
                                    vant.Toast(params.data.msg + '，修改成功，请重新登陆');
                                    setTimeout(() => {
                                        location.href = './index.html';
                                    }, 1500);
                                } else {
                                    vant.Toast(params.data.msg)
                                };
                            });
                    },

                    ourHref(params) {
                        sessionStorage.removeItem('num')
                        params < 1 ? location.href = './content.html' : params > 1 ? location.href = './user.html' : location.href = './order.html';
                    },

                    page(params) {
                        sessionStorage.setItem('num', this.num)
                        sessionStorage.setItem('searchKey', JSON.stringify({
                            key: this.search,
                            date: this.formDate,
                            tag: this.tag,
                            num: this.num
                        }))
                        location.href = `./details.html?workId=${params}`
                    },
                    toPage(params){
                        this.num = params
                        this.onLoad()
                    },
                    onLoad(bool = false) {
                        if(sessionStorage.getItem('searchKey') && !bool){
                            let d = JSON.parse(sessionStorage.getItem('searchKey'))
                            this.num = d.num
                            this.search = d.key
                            this.formDate = d.date
                            this.tag = d.tag
                            this.date = `${d.date[0]} 至 ${d.date[1]}`
                        }
                        axios.get('wechat_admin_work_list', {
                            params: {
                                status: this.tag > 0 ? this.tag : '',
                                page: this.num,
                                pageSize: 5,
                                key: this.search,
                                startTime: this.formDate[0],
                                endTime: this.formDate[1]
                            }
                        })
                            .then(params => {
                                this.show = false;
                                this.loadingShow = false;
                                if (params.data.state == 200) {
                                    this.list = [];
                                    this.total = params.data.page.total
                                    this.currentPage = this.num
                                    params.data.page.records.map((element, index) => {
                                        params.data.page.records[index]['work'] = '工单号：' + element.workId;
                                        params.data.page.records[index]['contact'] = `联系人：${element.contactName != -1 ? element.contactName : '无'}，联系电话：${element.contactPhone != -1 ? element.contactPhone : '无'}`;
                                        params.data.page.records[index]['src'] = 'https://www.zgksx.com/file/machinePic/041509001276628133.png';
                                        params.data.page.records[index]['logs'] = axios.get('work_log_list?workId=' + element.workId).then(param => {
                                            params.data.page.records[index]['logs'] = '无';
                                            if (param.data.state == 200) {
                                                sessionStorage.setItem('logs', JSON.stringify(param.data.list))
                                                params.data.page.records[index]['logs'] = '执行人：'+param.data.list[0].createName +'，内容：'+ param.data.list[0].logContent
                                            }
                                            return params.data.page.records[index]['logs']
                                        })
                                    })

                                    this.list.length > 0 ? this.list = this.list.concat(params.data.page.records) : this.list = params.data.page.records;
                                    this.removex();
                                } else if (params.data.state == 300) {
                                    this.loading = true;
                                } else {
                                    this.num = 1;
                                    vant.Toast(params.data.msg)
                                };
                            });
                    },

                    removex() {
                        this.$nextTick(function () {
                            let x = document.querySelectorAll('.van-card__num');
                            x.forEach(element => {
                                element.innerHTML = element.innerHTML.replace(/x/g, '');
                            })
                        })
                    },
                    onOversize(file) {
                        vant.Toast('文件大小不能超过 50M');
                    },

                    // 2020-8-3 追加地址
                    region(params){
                        console.log(params)
                        this.addressMsg = !this.addressMsg;
                        if(params){  // 提交地址
                            this.formData['citys'] = [];
                            params.forEach((element, index) => {
                                this.formData.citys.push(element.name);
                            })
                            this.formData.citys = this.formData.citys.toString().replace(/\[\]/g, '');
                            return false;
                        }
                    },

                    // 一下为 2020-07-27 启用视频上传
                    updataVideo(file) {
                        file.status = 'uploading';
                        file.message = '上传中';
                        var localFile = file.file, reader = new FileReader(), content;
                        reader.onload = (event) => {
                            content = event.target.result;
                            let _$file = new FormData();
                            _$file.append('file', localFile, 'machine_' + Math.random() + '.mp4');
                            axios({
                                method: "POST",
                                url: URLFiles + 'video_file_upload',
                                data: _$file,
                                processData: false,
                                traditional: true,
                                contentType: false,
                                headers: {
                                    "Content-Type": false
                                },
                                transformRequest: [function (data) {
                                    return data
                                }],
                            }).then(
                                response => {
                                    if (response.data.state == 200) {
                                        vant.Toast('上传成功！');
                                        this.videoFile = response.data.data.path;
                                        this.video = true;
                                    } else {
                                        vant.Toast(response.data.msg)
                                    }
                                }
                            ).catch((error) => {
                                console.log(error);
                            })
                        };
                        reader.onerror = function () {
                            vant.Toast("error");
                        };
                        reader.readAsDataURL(localFile, "UTF-8");

                    },

                    // 2020-07-27 追加内容
                    vistingTimeFn(){
                        this.timeMsg = true;
                    },
                    submitTime(params){
                        this.formData.visitingTime = this.getDateTime(params);
                        this.timeMsg = false;
                    },
                    getDateTime(data) {
                        var date = new Date(data);   //如果date为10位不需要乘1000
                        var Y = date.getFullYear() + '-';
                        var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
                        var D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' ';
                        var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
                        var m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
                        var s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
                
                        return Y + M + D + h + m + s;
                    },
                    addProduct(){
                        this.projects.push({name: '', _id: new Date().getTime()});
                        if (!/(iPhone|iPad|iPod|iOS|Android)/i.test(navigator.userAgent)) {
                            // this.bottomFooter = `bottom: -${document.querySelector(".center").offsetHeight - window.innerHeight}px`
                        }
                    },

                    deleteProduct(item){
                        this.projects.forEach((project, index) => {
                            if(item == index){
                                // 删除下标 为 item 的数据
                                this.projects.splice(index, 1);
                            }
                        })
                        if (!/(iPhone|iPad|iPod|iOS|Android)/i.test(navigator.userAgent)) {
                            // this.bottomFooter = `bottom: -${(this.projects.length + 1)* 85}px`
                        }
                    },
                    
                    // 一下为 2020-07-27 取消图片上传方法  2020-8-3 恢复图片上传
                    updataFile(params) {
                        return file => {
                            file.status = 'uploading';
                            var localFile = file.file;
                            var reader = new FileReader();
                            var content;
                            reader.onload = (event) => {
                                content = event.target.result;
                                // compress(content, 450, (contentFile) => {
                                let _$file = new FormData();
                                _$file.append('file', localFile, 'machineNumber_' + Math.random() + '.png');
                                axios({
                                    method: "POST",
                                    url: URLFiles + 'picture_file_upload',
                                    data: _$file,
                                    processData: false,
                                    traditional: true,
                                    contentType: false,
                                    headers: {
                                        "Content-Type": false
                                    },
                                    transformRequest: [function (data) {
                                        return data
                                    }],
                                    onUploadProgress: function (progressEvent) { //原生获取上传进度的事件
                                        if (progressEvent.lengthComputable) {
                                        }
                                    }
                                }).then(
                                    response => {
                                        if (response.data.state == 200) {
                                            setTimeout(() => {
                                                file.status = 'done';
                                                // this.fileImages.forEach(element => {
                                                //     arr = this.fileList.concat(this.fileLists, this.fileListss);  //合并数组
                                                //     arr.forEach(repeat => {
                                                //         console.log(repeat.file.name)
                                                //         console.log(element.isImage.localName)
                                                //         if(repeat.file.name == element.isImage.localName){
                                                //             vant.Toast('这个图片已经上传过了!');
                                                //             return false;
                                                //         }
                                                //     })
                                                // })
                                                this.fileImages.push({ url: response.data.data.path, isImage: { key: params, localName: file.file.name } });
                                            }, 1000)
                                        } else {
                                            vant.Toast(response.data.msg)
                                        }
                                    }
                                ).catch((error) => {
                                    console.log(error);
                                })
                                // })
                            };
                            reader.onerror = function () {
                                vant.Toast("error");
                            };
                            reader.readAsDataURL(localFile, "UTF-8");

                            function compress(content, size, callback) {  //压缩拍摄上传
                                if (content.length <= size * 1024) {
                                    callback(dataURItoBlob(content));
                                    return;
                                }
                                let canvas = document.createElement("canvas");
                                let ctx = canvas.getContext("2d");
                                let img = new Image();
                                img.src = content;
                                img.onload = function () {
                                    let width = img.width;
                                    let height = img.height;
                                    canvas.width = width;
                                    canvas.height = height;
                                    // 铺底色
                                    ctx.fillStyle = "#fff";
                                    ctx.fillRect(0, 0, width, height);
                                    ctx.drawImage(img, 0, 0, width, height);
                                    let rate = (1024 * size) / content.length;
                                    console.log(content.length * 1024);
                                    //进行压缩
                                    content = canvas.toDataURL("image/jpeg", 0.2);
                                    //压缩后
                                    console.log(content.length * 1024);
                                    let blob = dataURItoBlob(content);
                                    callback(blob);
                                };
                            }
                            /**
                             * base64 转二进制文件
                             * @param {*} base64Data 
                             */
                            function dataURItoBlob(base64Data) {
                                var bytes = window.atob(base64Data.split(',')[1]); //去掉url的头，并转换为byte

                                //处理异常,将ascii码小于0的转换为大于0
                                var ab = new ArrayBuffer(bytes.length);
                                var ia = new Uint8Array(ab);
                                for (var i = 0; i < bytes.length; i++) {
                                    ia[i] = bytes.charCodeAt(i);
                                }
                                return new Blob([ab], {
                                    type: 'image/png'
                                });
                            }
                        }

                    },

                    deleteFn(params) {
                        return file => {
                            let _arr_ = [];
                            this.fileImages.forEach(element => {
                                try {
                                    if (file.file.name != element.isImage.localName) {
                                        _arr_.push(element)
                                    }
                                } catch (error) {
                                    if (file.url != element.url) {
                                        _arr_.push(element)
                                    }
                                }
                            })
                            this.fileImages = _arr_;
                            return true;
                        }
                    },
                    
                    /**
                     * 2020-9-1 增加在线沟通渠道
                     * 
                     * **/ 
                    goToChat () {
                        if (window.navigator.userAgent.toLowerCase().match(/MicroMessenger/i) != 'micromessenger'){//eslint-disable-line
                            location.href = '/por/master/#/winchat?workId=' + this.getQueryString('workId')
                        } else {
                            location.href = '/por/master/#/chat?workId=' + this.getQueryString('workId')
                        }
                    },

                    // ###### Thu Sep 24 16:06:18 CST 2020
                    dobient () {
                        axios.post('sys_repairs_type_list', qs.stringify({  //查看报修分类列表
                            page: 1,
                            pageSize: 20
                        }))
                        .then(res => {
                            if (res.data.state == 200) {
                                let _arr_= [];
                                _arr_.push({ text: '修改保修类型' })
                                _arr_[0]['children'] = [];
                                res.data.page.records.forEach(element => {
                                    _arr_[0]['children'].push({
                                        text: element.repairsTypeName,
                                        id: element.repairsTypeId
                                    })
                                })
                                this.items = _arr_;

                            } else {
                                vant.Toast(params.data.msg)
                            };
                        });
                    },

                    // ###### Thu Sep 24 16:11:27 CST 2020
                    onSelectDetails (params) {
                        this.$dialog.confirm({
                            title: '提示',
                            message: '是否修改报修类型？',
                        })
                        .then(() => {
                            axios.post('wechat_edit_work_repairs_type', qs.stringify({
                                workId: this.getQueryString('workId'),
                                repairsTypeId: params.id
                            }))
                            .then(res => {
                                vant.Toast(res.data.msg)
                                this.detailsMessage()
                                this.contentMsg = false
                            });
                        })
                        .catch(() => {
                            // on cancel
                        });
                    },

                    //  ###### Thu Sep 24 16:31:37 CST 2020
                    detailsMessage () {
                        if(sessionStorage.getItem('logs')) {
                            this.logs = JSON.parse(sessionStorage.getItem('logs'))
                        }
                        axios.get('sys_work_detail?workId=' + this.getQueryString('workId')).then(params => {
                            setTimeout(() => {
                                this.show = false;
                                this.loadingShow = false;
                            }, 1000)
                            if (params.data.state == 200) {
                                this.workList = {};
                                Object.keys(params.data.data).forEach((element, index) => {
                                //     if (this.alias.get(element)) {
                                //         if (element == 'machineBrandPic' || element == 'machineOverallPic' || element == 'faultPartPic') {
                                //             this.workList.push({ name: this.alias.get(element), value: '', view: Object.values(params.data.data)[index] })
                                //         } else {
                                            if (element == 'creationType') {
                                                params.data.data[element] = this.creationType.get(parseInt(Object.values(params.data.data)[index]))
                                            }
                                //             } else {
                                            if(element == 'facilityName'){
                                                let arr = [];
                                                try {
                                                    JSON.parse(Object.values(params.data.data)[index]).map((element, index) => {
                                                        arr.push(element.name);
                                                    })
                                                    params.data.data[element] =  arr.toString().replace(/\[\]/g, '');
                                                } catch (error) {
                                                    console.info(error)
                                                }
                                            }
                                            if (element == 'status') {
                                                params.data.data[element] =  this.status.get(Object.values(params.data.data)[index])
                                            } else {
                                                params.data.data[element] = Object.values(params.data.data)[index] == -1 ? '无' : Object.values(params.data.data)[index]
                                            }
                                //             }

                                //         }
                                //     }
                                })
                                this.workList = params.data.data;
                            } else {
                                // vant.Toast('获取数据异常！请重试');
                                setTimeout(() => {
                                    location.href = './order.html';
                                }, 500)
                            }
                        })
                    },

                    // ###### Mon Oct 12 14:11:09 CST 2020
                    viewpic (params) {
                        // vant.ImagePreview([params])
                    },

                    // ###### Tue Jan 12 13:46:13 CST 2021
                    getDateTime: function (data) {
                        var date = new Date(data);   //如果date为10位不需要乘1000
                        var Y = date.getFullYear() + '-';
                        var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
                        var D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()) + ' ';
                        var h = (date.getHours() < 10 ? '0' + date.getHours() : date.getHours()) + ':';
                        var m = (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes()) + ':';
                        var s = (date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds());
                
                        return Y + M + D + h + m + s;
                    },
                    onConfirm (date) {
                        const [start, end] = date;
                        this.dataShow = false;
                        this.date = `${this.getDateTime(start).split(' ')[0]} 至 ${this.getDateTime(end).split(' ')[0]}`;
                        this.formDate =[this.getDateTime(start).split(' ')[0],this.getDateTime(end).split(' ')[0]]
                        this.onLoad(true)
                    },
                    searAddress () {
                        if (!this.formData._textarea) return;
                        try {
                            this.formData.shopName = this.formData._textarea.split(/[\n]/)[0].split('：')[1]

                            this.formData.contactName = this.formData._textarea.split(/[\n]/)[7].split('：')[1].split(' ')[0]
                            this.formData.contactPhone = this.formData._textarea.split(/[\n]/)[7].split('：')[1].split(' ')[1]

                            this.projects.push({
                                name: `${this.formData._textarea.split(/[\n]/)[1].split('：')[1]}，编码：${this.formData._textarea.split(/[\n]/)[4].split('：')[1]}，${this.formData._textarea.split(/[\n]/)[2].split('：')[1]}`, 
                                _id: new Date().getTime()
                            });

                            axios.post('wechat_address_parse', qs.stringify({
                                address: this.formData._textarea.split(/[\n]/)[8].split('：')[1]
                            })).then(params => {
                                if(params.data.state == 200) {
                                    this.formData.citys = params.data.data.province+','+params.data.data.city+','+params.data.data.district
                                    this.formData.address = this.formData._textarea.split(/[\n]/)[8].split('：')[1]
                                } else {
                                    vant.Toast('地址无法识别，请手动输入')
                                }
                            })
                        } catch (error) {
                            vant.Toast('全部/部分出错，请手动检查修改')
                        }
                    }

                },
            });
            // 通过 CDN 引入时不会自动注册 Lazyload 组件
            // 可以通过下面的方式手动注册
            Vue.use(vant.Lazyload);
        } catch (error) {
            if (/vant/.test(error)) {
                let e = '?isNot=1';
                if (/isNot/.test(location.href)) { //存在计数器
                    let n = location.href.substring(location.href.lastIndexOf('?'));
                    n = n.split('=')[1];
                    n = parseInt(n) + 1;
                    e = '?isNot=' + n;
                    if (n > 2) {
                        vant.Toast('貌似网络有点问题！');
                        return false;
                    };
                }
                location.href = location.href.split('?')[0] + e;
            }
            console.info(error);
        }
    }, 0)
}
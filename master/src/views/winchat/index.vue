<template lang="pug">
    .container
        header
            .box
                van-image(:src="user.pic" round)
                span {{ user.name }}
            .files(@click="onSelect({id: 1})")
                van-icon(name="paid")
        .chat
            van-popup(v-model="pageTop" position="top")
                div(style="margin: 10px 0; cursor: pointer;" @click="num = num + 1;page(true);") 查看上一页记录
            div(v-for="(oldItem, index) in oldChat" v-bind:keys="index")
                .youChat(v-if="oldItem.senderId != senderId")
                    van-image(:src="oldItem.headImgUrl" round)
                    .your_text
                        span(v-if="oldItem.contentType == 0") {{ oldItem.content }}
                        img(:src="oldItem.content" v-if="oldItem.contentType == 1" style="width: 200px;")
                        video(:src="oldItem.content" v-if="oldItem.contentType == 2" controls="controls" style="width: 200px;")
                        .time {{ oldItem.createTime }}
                .meChat(v-else)
                    .me_text
                        span(v-if="oldItem.contentType == 0") {{ oldItem.content }}
                        img(:src="oldItem.content" v-if="oldItem.contentType == 1" style="width: 200px;")
                        video(:src="oldItem.content" v-if="oldItem.contentType == 2" controls="controls" style="width: 200px;")
                        .time {{ oldItem.createTime }}
            div(v-for="(item, index) in myChat" v-bind:keys="index")
                .youChat(v-if="item.senderId != senderId")
                    van-image(:src="item.headImgUrl" round)
                    .your_text
                        span(v-if="item.contentType == 0") {{ item.content }}
                        img(:src="item.content" v-if="item.contentType == 1" style="width: 200px;")
                        video(:src="item.content" v-if="item.contentType == 2" controls="controls" style="width: 200px;")
                        .time {{ item.createTime }}
                .meChat(v-else)
                    .me_text
                        span(v-if="item.contentType == 0") {{ item.content }}
                        img(:src="item.content" v-if="item.contentType == 1" style="width: 200px;")
                        video(:src="item.content" v-if="item.contentType == 2" controls="controls" style="width: 200px;")
                        .time {{ item.createTime }}
        .send
            van-field(type="textarea" v-model="chatText" placeholder="输入内容")
            van-button(color="#A4ABC0" @click="websocketsend") 发送
        input(type="file" accept="image/*,video/*" style="display: none" id="file1")
        van-dialog(v-model="file.bool" :title="file.title" show-cancel-button style="height: 300px" @confirm="websocketsend")
            van-loading(v-if='file.load')
            img(:src="file.value" style="height: 155px" v-if="file.type == 1")
            video(:src="file.value" controls="controls" style="height: 155px" v-if="file.type == 2")
</template>

<script>
export default {
  name: 'winchat',
  data () {
    return {
        yourImage: '/static/images/you_image.png',
        photo: '/static/images/photo.png',
        pageTop: false,
        myChat: [],
        youChat: [],
        oldChat: [],
        bscok: null,
        num: 1,
        chatText: '',
        user: {
            pic: '/static/images/you_image.png'
        },
        formData: new FormData(),
        file: {
            bool: false,
            load: true,
            type: 2,
            title: '上传中',
            value: ''
        },
        senderId: JSON.parse(sessionStorage.getItem('token')).asset.adminId,
        timeSin: 1000
    }
  },
  methods: {
        onSelect (params) {
            document.querySelector(`#file${params.id}`).click()
            document.querySelector(`#file${params.id}`).onchange = (file) => {
                this.file.bool = true
                this.formData.append('file', file.srcElement.files[0], 'machine_' + Math.random())
                var xml = new XMLHttpRequest()
                xml.open('post', `https://file.zgksx.com/${/video/g.test(file.srcElement.files[0].type) ? 'video_file_upload' : 'picture_file_upload'}`, true)
                xml.onreadystatechange = () => {
                    if (xml.readyState == 4 && xml.status == 200) {//eslint-disable-line
                        let $ms = JSON.parse(xml.responseText)
                        if ($ms.state != 200) {//eslint-disable-line
                            this.$toast('上传失败!')
                            this.file = {
                                load: false,
                                title: '上传失败',
                                value: ''
                            }
                            return false
                        }
                        this.file = {
                            type: /video/g.test(file.srcElement.files[0].type) ? 2 : 1,
                            value: $ms.data.path,
                            load: false,
                            title: '上传成功!, 是否发送',
                            bool: true
                        }
                    }
                }
                xml.send(this.formData)
            }
        },
        viewInfo (params) {
            try {
                this.api.httpRequest({url: 'view_user_info', methods: 'GET', data: {workId: this.$route.query.workId, senderId: params.senderId, isCustomer: params.isCustomer}})
                .then(params => {
                    if (params.data.state != 200) {//eslint-disable-line
                        this.$toast(params.data.msg)
                        return false
                    }
                    this.user = {
                        pic: params.data.data.headImgUrl || this.yourImage,
                        name: params.data.data.adminName || '在线沟通'
                    }
                })
            } catch (error) {
                console.log(error)
            }
        },
        initWebSocket () {
            const ws = `${this.URL.ws + this.$route.query.workId}?token=${sessionStorage.getItem('token') ? JSON.parse(sessionStorage.getItem('token')).asset.secret : ''}`
            this.bscok = new WebSocket(ws)
            this.bscok.onmessage = this.websocketonmessage
            this.bscok.onopen = this.websocketonopen
            this.bscok.onerror = this.websocketonerror
            this.bscok.onclose = this.websocketclose
        },
        websocketonopen () {},
        websocketonerror () { // 连接建立失败重连
            console.log('重连中...')
            this.initWebSocket()
        },
        websocketonmessage (e) { // 数据接收
            const redata = JSON.parse(e.data)
            if (redata.contentType == 4) {//eslint-disable-line
                this.$toast(redata.content)
                return false
            }
            this.myChat.length > 0 ? this.myChat = this.myChat.concat(redata) : this.myChat.push(redata)
            this.autoHeight()
        },
        websocketsend (Data) { // 数据发送
            if (!this.chatText && !this.file.value) {
                return false
            }
            this.bscok.send(JSON.stringify({
                content: this.file.value ? this.file.value : this.chatText,
                contentType: this.file.value ? this.file.type : 0
            }))
            this.chatText = ''
            this.file = {
                title: '上传中',
                bool: false
            }
        },
        websocketclose (e) { // 关闭
            console.log('断开连接', e)
            setTimeout(() => {
                this.timeSin++
                if (this.timeSin > 1010) {
                    // 重连10次
                    return false
                }
                this.websocketonerror()
            }, this.timeSin)
        },
        autoHeight () {
            setTimeout(() => {
                var t = document.querySelector('.chat').offsetHeight
                window.scroll({ top: t, left: 0, behavior: 'smooth' })
            }, 1000)
        },
        pageTopFn () {
            let top = document.documentElement.scrollTop || document.body.scrollTop
            if (this.oldChat.length < 10) {
                return
            }
            if (top < 10) {//eslint-disable-line
                this.pageTop = true
            } else {
                this.pageTop = false
            }
        },
        page (param) {
            this.api.httpRequest({
                url: 'communication_page',
                methods: 'GET',
                data: {
                    workId: this.$route.query.workId,
                    page: this.num,
                    pageSize: 10
                }
            })
            .then(params => {
                if (params.data.state != 200) {//eslint-disable-line
                    this.$toast(params.data.msg)
                    return false
                }
                // 翻页操作
                if (this.oldChat.length > 0) {
                    this.oldChat = params.data.page.records.reverse().concat(this.oldChat)
                } else {
                    // 首次加载
                    if (params.data.page.records.length > 0) {
                        this.oldChat = params.data.page.records.reverse()
                    } else {
                        this.oldChat = []
                    }
                }
                // this.oldChat.length > 0 ? this.oldChat = this.oldChat.concat(params.data.page.records) : this.oldChat = params.data.page.records
                if (param) {
                    this.pageTop = false
                } else {
                    this.autoHeight()
                }
            })
        }
    },
    destroyed () {
        this.bscok.close() // 离开路由之后断开websocket连接
    },
    created () {
        window.onscroll = () => {
            this.pageTopFn()
        }
        this.initWebSocket()
        this.page()
    }
}
</script>

<style lang="scss" scoped>
body{
    max-width: 100%;
}
.container {
    header{
        height: 80px;
        width: 100%;
        background-color: #5E636D;
        color: white;
        line-height: 80px;
        position: fixed;
        top: 0;
        left: 0;
        z-index: 99;
        .box{
            width: 100px;
            margin: 0 auto;
            position: relative;
            .van-image{
                width: 50px;
                height: 50px;
                margin-top: 15px;
                float: left;
            }
            span{
                position: absolute;
                left: 60px;
                top: 0px;
            }
        }
        .files{
            float: right;
            margin-right: 30px;
            font-size: 30px;
        }
    }
    .chat{
        margin-bottom: 260px;
        margin-top: 82px;
        .youChat {
            width: 100%;
            padding: 20px 10px;
            box-sizing: border-box;
            height: auto;
            overflow: hidden;
            .van-image{
                width: 50px;
                height: 50px;
                float: left;
            }
            .your_text{
                background-color: white;
                border-radius: 0 10px 10px 10px;
                padding: 10px;
                box-sizing: border-box;
                margin-right: 10px;
                margin-left: 60px;
                margin-top: 20px;
                text-align: left;
                position: relative;
                display: table;
                .time{
                    font-size: 10px;
                    position: absolute;
                    bottom: -20px;
                    left: 0;
                    width: 300px;
                    text-align: left;
                    color: #999999;
                }
            }
        }
        .meChat{
            width: 100%;
            height: auto;
            overflow: hidden;
            padding: 20px 10px;
            box-sizing: border-box;
            .me_text{
                background: #A4ABC0;
                float: right;
                border-radius:10px 0 10px 10px;
                display: table;
                padding: 10px;
                position: relative;
                box-sizing: border-box;
                .time{
                    font-size: 10px;
                    position: absolute;
                    bottom: -20px;
                    right: 0;
                    width: 300px;
                    text-align: right;
                    color: #999999;
                }
            }
        }
        .old_time{
            width: 100%;
            height: auto;
            overflow: hidden;
            font-size: 14px;
            color: #C4C4C4;
        }
    }
    .send {
        width: 100%;
        height: 250px;
        background: white;
        position: fixed;
        bottom: 0;
        left: 0;
        .van-field{
            padding: 10px;
            box-sizing: border-box;
            width: 100%;
            textarea{
                height: 250px;
            }
        }
        .van-button{
            position: absolute;
            right: 20px;
            bottom: 0;
            margin: 8px 10px;
            width: 20%;
            height: 35px;
        }
    }
}
</style>

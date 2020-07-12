import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/axios'
import './plugins/element.js'
import moment from "moment";
import './assets/css/global.css'
//富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

//进度条
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(config => {
	NProgress.start()
	config.headers.Authorization = window.sessionStorage.getItem('token')
	return config
})
axios.interceptors.response.use(config => {
	NProgress.done()
	return config
})


Vue.filter('dateFormat', function (value, format = 'YYYY-MM-DD HH:mm:ss') {
	return moment(value).format(format)
})


Vue.use(VueQuillEditor)


Vue.config.productionTip = false

new Vue({
	router,
	render: h => h(App)
}).$mount('#app')

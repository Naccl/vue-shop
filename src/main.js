import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/axios'
import './plugins/element.js'
import moment from "moment";
import './assets/css/global.css'


axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(config => {
	config.headers.Authorization = window.sessionStorage.getItem('token')
	return config
})


Vue.filter('dateFormat', function (value, format = 'YYYY-MM-DD HH:mm:ss') {
	return moment(value).format(format)
})


Vue.config.productionTip = false

new Vue({
	router,
	store,
	render: h => h(App)
}).$mount('#app')

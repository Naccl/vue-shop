import App from './App.vue'
import router from './router'
import './assets/css/global.css'

axios.defaults.baseURL = 'https://api.naccl.top/vue/shop/api/private/v1/'
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


Vue.config.productionTip = false

new Vue({
	router,
	render: h => h(App)
}).$mount('#app')

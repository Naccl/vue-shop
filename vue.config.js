module.exports = {
	chainWebpack: config => {
		//生产环境
		config.set('externals', {
			'vue': 'Vue',
			'vue-router': 'VueRouter',
			'axios': 'axios',
			'lodash': '_',
			'echarts': 'echarts',
			'nprogress': 'NProgress',
			'vue-quill-editor': 'VueQuillEditor',
			'moment': 'moment',
			'element-ui': 'ELEMENT'
		})
	}
}
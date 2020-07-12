//项目发布阶段使用的babel插件
const prodPlugins = []
if (process.env.NODE_ENV === 'production') {
	prodPlugins.push('transform-remove-console')
}

module.exports = {
	"presets": [
		"@vue/cli-plugin-babel/preset"
	],
	'plugins': [
		...prodPlugins
	]
}
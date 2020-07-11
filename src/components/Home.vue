<template>
	<el-container class="home-container">
		<!--头部-->
		<el-header>
			<div>
				<img src="../assets/logo.png" alt="" height="60">
				<span>电商后台管理系统</span>
			</div>
			<el-button type="info" @click="logout">退出</el-button>
		</el-header>
		<!--页面主体-->
		<el-container>
			<!--侧边栏-->
			<el-aside :width="isCollapse? '64px' : '200px'">
				<div class="toggle-button" @click="isCollapse=!isCollapse"><i :class="isCollapse?'el-icon-s-unfold':'el-icon-s-fold'"></i></div>
				<!--菜单-->
				<el-menu background-color="#333744" text-color="#fff" active-text-color="#409eff" :default-openeds="defaultOpeneds"
				         :unique-opened="false" :collapse="isCollapse" :collapse-transition="false"
				         :router="true" :default-active="activePath">
					<!-- 一级菜单 -->
					<el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
						<!-- 一级菜单的模板区域 -->
						<template slot="title">
							<i :class="iconsObj[item.id]"></i>
							<span>{{ item.authName }}</span>
						</template>
						<!-- 二级菜单 -->
						<el-menu-item :index="'/'+subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/'+subItem.path)">
							<template slot="title">
								<i class="el-icon-menu"></i>
								<span>{{ subItem.authName }}</span>
							</template>
						</el-menu-item>
					</el-submenu>
				</el-menu>
			</el-aside>
			<!--右侧内容主体-->
			<el-main>
				<router-view></router-view>
			</el-main>
		</el-container>
	</el-container>
</template>

<script>
	export default {
		name: "Home",
		data() {
			return {
				menulist: [],
				iconsObj: {
					'125': 'iconfont el-icon-user-solid',
					'103': 'iconfont el-icon-s-grid',
					'101': 'iconfont el-icon-s-management',
					'102': 'iconfont el-icon-s-order',
					'145': 'iconfont el-icon-s-data',
				},
				//是否折叠
				isCollapse: false,
				//被激活的链接地址
				activePath: '',
				//默认打开的菜单
				defaultOpeneds: []
			}
		},
		created() {
			this.getMenuList()
			this.activePath = window.sessionStorage.getItem('activePath')
		},
		methods: {
			logout() {
				window.sessionStorage.clear()
				this.$router.push('/login')
			},
			//获取所有的菜单
			getMenuList() {
				axios.get('menus').then(response => {
					const res = response.data
					if (res.meta.status === 200) {
						res.data.forEach(item => {
							this.defaultOpeneds.push('' + item.id)
						})
						this.menulist = res.data
					} else {
						this.$message.error(res.meta.msg)
					}
				}).catch(() => {
					this.$message.error("获取失败")
				})
			},
			//保存链接的激活状态
			saveNavState(activePath) {
				this.activePath = activePath
				window.sessionStorage.setItem('activePath', activePath)
			}
		}
	}
</script>

<style lang="less" scoped>
	.home-container {
		height: 100%;
	}

	.el-header {
		background-color: #373D41;
		display: flex;
		justify-content: space-between;
		padding-left: 10px;
		align-items: center;
		color: #ffffff;
		font-size: 22px;

		> div {
			display: flex;
			align-items: center;

			span {
				margin-left: 15px;
			}
		}
	}

	.el-aside {
		background-color: #333744;

		.el-menu {
			border-right: none;
		}
	}

	.el-main {
		background-color: #eaedf1;
	}

	.iconfont {
		margin-right: 20px;
		font-size: 20px;
	}

	.toggle-button {
		background-color: #4a5064;
		font-size: 20px;
		line-height: 40px;
		color: #ffffff;
		text-align: center;
		cursor: pointer;
	}
</style>
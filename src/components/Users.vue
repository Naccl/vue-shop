<template>
	<div>
		<!--面包屑导航区-->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>用户管理</el-breadcrumb-item>
			<el-breadcrumb-item>用户列表</el-breadcrumb-item>
		</el-breadcrumb>

		<!--卡片视图区域-->
		<el-card>
			<!--搜索与添加-->
			<el-row :gutter="10">
				<el-col :span="6">
					<el-input placeholder="请输入内容" v-model="queryInfo.query" :clearable="true" @clear="getUserList">
						<el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
					</el-input>
				</el-col>
				<el-col :span="6">
					<el-button type="primary">添加用户</el-button>
				</el-col>
			</el-row>

			<!--用户列表-->
			<el-table :data="userList" :border="true" :stripe="true">
				<el-table-column label="序号" type="index" width="50"></el-table-column>
				<el-table-column label="姓名" prop="username"></el-table-column>
				<el-table-column label="邮箱" prop="email"></el-table-column>
				<el-table-column label="电话" prop="mobile"></el-table-column>
				<el-table-column label="角色" prop="role_name"></el-table-column>
				<el-table-column label="状态">
					<template v-slot="scope">
						<el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
					</template>
				</el-table-column>
				<el-table-column label="操作" width="200">
					<template v-slot="scope">
						<!--修改按钮-->
						<el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
						<!--删除按钮-->
						<el-button type="danger" icon="el-icon-delete" size="mini"></el-button>
						<!--分配角色按钮-->
						<el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
							<el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
						</el-tooltip>
					</template>
				</el-table-column>
			</el-table>

			<!--分页-->
			<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum"
			               :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize" :total="total"
			               layout="total, sizes, prev, pager, next, jumper">
			</el-pagination>
		</el-card>
	</div>
</template>

<script>
	export default {
		name: "Users",
		data() {
			return {
				//获取用户列表的参数对象
				queryInfo: {
					query: '',
					pagenum: 1,//当前的页数
					pagesize: 2//当前每页显示多少条数据
				},
				userList: [],
				total: 0
			}
		},
		created() {
			this.getUserList()
		},
		methods: {
			getUserList() {
				axios.get('users', {params: this.queryInfo}).then(response => {
					const res = response.data
					console.log(res)
					if (res.meta.status === 200) {
						this.userList = res.data.users
						this.total = res.data.total
					} else {
						this.$message.error(res.meta.msg)
					}
				}).catch(error => {
					this.$message.error("获取失败")
				})
			},
			//监听pagesize改变的事件
			handleSizeChange(newSize) {
				this.queryInfo.pagesize = newSize
				this.getUserList()
			},
			//监听页码值改变的事件
			handleCurrentChange(newPage) {
				this.queryInfo.pagenum = newPage
				this.getUserList()
			},
			//监听switch开关状态的改变
			userStateChanged(userInfo) {
				axios.put(`users/${userInfo.id}/state/${userInfo.mg_state}`).then(response => {
					const res = response.data
					if (res.meta.status === 200) {
						this.$message.success(res.meta.msg)
					} else {
						userInfo.mg_state = !userInfo.mg_state
						this.$message.error(res.meta.msg)
					}
				}).catch(error => {
					this.$message.error("操作失败")
				})
			}
		}
	}
</script>

<style lang="less" scoped>

</style>
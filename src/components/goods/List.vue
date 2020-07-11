<template>
	<div>
		<!--面包屑导航区-->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>商品管理</el-breadcrumb-item>
			<el-breadcrumb-item>商品列表</el-breadcrumb-item>
		</el-breadcrumb>

		<el-card>
			<!--搜索与添加-->
			<el-row :gutter="10">
				<el-col :span="6">
					<el-input placeholder="请输入内容" v-model="queryInfo.query" :clearable="true" @clear="getGoodsList">
						<el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
					</el-input>
				</el-col>
				<el-col :span="6">
					<el-button type="primary" @click="goAddPage">添加商品</el-button>
				</el-col>
			</el-row>

			<!--table表格-->
			<el-table :data="goodsList" border stripe>
				<el-table-column label="序号" type="index" width="50"></el-table-column>
				<el-table-column label="商品名称" prop="goods_name"></el-table-column>
				<el-table-column label="商品价格(元)" prop="goods_price" width="130"></el-table-column>
				<el-table-column label="商品重量" prop="goods_weight" width="130"></el-table-column>
				<el-table-column label="创建时间" prop="add_time" width="200">
					<template v-slot="scope">{{ scope.row.add_time | dateFormat}}</template>
				</el-table-column>
				<el-table-column label="操作" width="200">
					<template v-slot="scope">
						<el-button type="primary" icon="el-icon-edit" size="mini" @click="goEditPage(scope.row.goods_id)">编辑</el-button>
						<el-popconfirm title="确定删除吗？" icon="el-icon-delete" iconColor="red" @onConfirm="removeById(scope.row.goods_id)">
							<el-button size="mini" type="danger" icon="el-icon-delete" slot="reference">删除</el-button>
						</el-popconfirm>
					</template>
				</el-table-column>
			</el-table>

			<!--分页-->
			<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum"
			               :page-sizes="[5, 10, 15, 20]" :page-size="queryInfo.pagesize" :total="total"
			               layout="total, sizes, prev, pager, next, jumper" background>
			</el-pagination>
		</el-card>
	</div>
</template>

<script>
	export default {
		name: "List",
		data() {
			return {
				queryInfo: {
					query: '',
					pagenum: 1,
					pagesize: 10
				},
				goodsList: [],
				total: 0,

			}
		},
		created() {
			this.getGoodsList()
		},
		methods: {
			getGoodsList() {
				axios.get('goods', {params: this.queryInfo}).then(response => {
					const res = response.data
					if (res.meta.status === 200) {
						this.goodsList = res.data.goods
						this.total = res.data.total
					} else {
						this.$message.error(res.meta.msg)
					}
				}).catch(() => {
					this.$message.error("获取失败")
				})
			},
			//监听pagesize改变的事件
			handleSizeChange(newSize) {
				this.queryInfo.pagesize = newSize
				this.getGoodsList()
			},
			//监听页码值改变的事件
			handleCurrentChange(newPage) {
				this.queryInfo.pagenum = newPage
				this.getGoodsList()
			},
			removeById(id){
				axios.delete(`goods/${id}`).then(response => {
					const res = response.data
					if (res.meta.status === 200) {
						this.$message.success(res.meta.msg)
						this.getGoodsList()
					} else {
						this.$message.error(res.meta.msg)
					}
				}).catch(() => {
					this.$message.error("操作失败")
				})
			},
			goAddPage(){
				this.$router.push('/goods/add')
			},
			goEditPage(id){
				this.$router.push(`/goods/edit/${id}`)
			}
		}
	}
</script>

<style lang="less" scoped>
	.el-button {
		margin-right: 10px;
	}
</style>
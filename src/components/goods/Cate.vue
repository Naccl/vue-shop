<template>
	<div>
		<!--面包屑导航区-->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>商品管理</el-breadcrumb-item>
			<el-breadcrumb-item>商品分类</el-breadcrumb-item>
		</el-breadcrumb>

		<!--卡片视图区域-->
		<el-card>
			<!--添加分类按钮-->
			<el-row>
				<el-col>
					<el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
				</el-col>
			</el-row>

			<!-- vue-table-with-tree-grid依赖 树形列表 -->
			<!--<tree-table class="treeTable" :data="cateList" :columns="columns" :selection-type="false" :expand-type="false"
			            :show-index="true" :border="true" :stripe="false">
				&lt;!&ndash;是否有效&ndash;&gt;
				<template slot="isok" slot-scope="scope">
					<i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen"></i>
					<i class="el-icon-error" v-else style="color: red"></i>
				</template>
				&lt;!&ndash;排序&ndash;&gt;
				<template slot="order" slot-scope="scope">
					<el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
					<el-tag size="mini" type="success" v-else-if="scope.row.cat_level===1">二级</el-tag>
					<el-tag size="mini" type="warning" v-else>三级</el-tag>
				</template>
				&lt;!&ndash;操作&ndash;&gt;
				<template slot="opt" slot-scope="scope">
					<el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row)">编辑</el-button>
					<el-popconfirm title="确定删除吗？" icon="el-icon-delete" iconColor="red" @onConfirm="removeCateById(scope.row.cat_id)">
						<el-button size="mini" type="danger" icon="el-icon-delete" slot="reference">删除</el-button>
					</el-popconfirm>
				</template>
			</tree-table>-->

			<!-- Element 树形列表 -->
			<el-table :data="cateList" row-key="cat_id" :tree-props="{children: 'children'}" :border="true" :stripe="true">
				<el-table-column label="序号" type="index" width="50"></el-table-column>
				<el-table-column label="分类名称" prop="cat_name"></el-table-column>
				<el-table-column label="是否有效">
					<template v-slot="scope">
						<i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen"></i>
						<i class="el-icon-error" v-else style="color: red"></i>
					</template>
				</el-table-column>
				<el-table-column label="排序">
					<template v-slot="scope">
						<el-tag size="mini" v-if="scope.row.cat_level===0">一级</el-tag>
						<el-tag size="mini" type="success" v-else-if="scope.row.cat_level===1">二级</el-tag>
						<el-tag size="mini" type="warning" v-else>三级</el-tag>
					</template>
				</el-table-column>
				<el-table-column label="操作">
					<template v-slot="scope">
						<el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row)">编辑</el-button>
						<el-popconfirm title="确定删除吗？" icon="el-icon-delete" iconColor="red" @onConfirm="removeCateById(scope.row.cat_id)">
							<el-button size="mini" type="danger" icon="el-icon-delete" slot="reference">删除</el-button>
						</el-popconfirm>
					</template>
				</el-table-column>
			</el-table>

			<!--分页-->
			<el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="queryInfo.pagenum"
			               :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize" :total="total"
			               layout="total, sizes, prev, pager, next, jumper" background>
			</el-pagination>
		</el-card>

		<!--添加分类的对话框-->
		<el-dialog title="添加分类" width="50%" :visible.sync="addCateDialogVisible" :close-on-click-modal="false" @close="addCateDialogClosed">
			<!--内容主体-->
			<el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="80px">
				<el-form-item label="分类名称" prop="cat_name">
					<el-input v-model="addCateForm.cat_name"></el-input>
				</el-form-item>
				<el-form-item label="父级分类">
					<!-- options指定数据源 -->
					<!-- props指定配置对象 -->
					<el-cascader v-model="selectedKeys" :options="parentCateList" :props="cascaderProps" @change="parentCateChange" :clearable="true"></el-cascader>
				</el-form-item>
			</el-form>
			<!--底部-->
			<span slot="footer">
				<el-button @click="addCateDialogVisible=false">取 消</el-button>
				<el-button type="primary" @click="addCate">确 定</el-button>
			</span>
		</el-dialog>

		<!--编辑分类的对话框-->
		<el-dialog title="编辑分类" width="50%" :visible.sync="editCateDialogVisible" :close-on-click-modal="false" @close="editCateDialogClosed">
			<!--内容主体-->
			<el-form :model="editCateForm" :rules="editCateFormRules" ref="editCateFormRef" label-width="80px">
				<el-form-item label="分类名称" prop="cat_name">
					<el-input v-model="editCateForm.cat_name"></el-input>
				</el-form-item>
			</el-form>
			<!--底部-->
			<span slot="footer">
				<el-button @click="editCateDialogVisible=false">取 消</el-button>
				<el-button type="primary" @click="editCate">确 定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
	export default {
		name: "Cate",
		data() {
			return {
				//添加分类对话框显示状态
				addCateDialogVisible: false,
				//添加分类的表单数据对象
				addCateForm: {
					cat_name: '',
					//父级分类id
					cat_pid: 0,
					//分类的等级，默认添加一级分类
					cat_level: 0
				},
				addCateFormRules: {
					cat_name: [
						{required: true, message: '请输入分类名称', trigger: 'blur'}
					]
				},
				//父级分类的列表
				parentCateList: [],
				//指定级联选择器的配置对象
				cascaderProps: {
					expandTrigger: 'hover',
					//设置为可选中一级分类
					checkStrictly: true,
					value: 'cat_id',
					label: 'cat_name',
					children: 'children'
				},
				//选中的父级分类的id数组
				selectedKeys: [],
				//编辑分类的对话框显示状态
				editCateDialogVisible: false,
				//编辑分类的表单数据对象
				editCateForm: {
					cat_id: 0,
					cat_name: ''
				},
				editCateFormRules: {
					cat_name: [
						{required: true, message: '请输入分类名称', trigger: 'blur'}
					]
				},
				//获取分类列表的参数对象
				queryInfo: {
					type: 3,
					pagenum: 1,//当前的页数
					pagesize: 5//当前每页显示多少条数据
				},
				//商品分类的数据列表
				cateList: [],
				//总数据条数
				total: 0,
				columns: [
					{
						label: '分类名称',
						prop: 'cat_name'
					},
					{
						label: '是否有效',
						//将当前列定义为模板列
						type: 'template',
						//模板名称
						template: 'isok'
					},
					{
						label: '排序',
						//将当前列定义为模板列
						type: 'template',
						//模板名称
						template: 'order'
					},
					{
						label: '操作',
						//将当前列定义为模板列
						type: 'template',
						//模板名称
						template: 'opt'
					}
				]
			}
		},
		created() {
			this.getCateList()
		},
		methods: {
			//获取商品分类数据
			getCateList() {
				axios.get('categories', {params: this.queryInfo}).then(response => {
					const res = response.data
					if (res.meta.status === 200) {
						this.cateList = res.data.result
						this.total = res.data.total
					} else {
						this.$message.error(res.meta.msg)
					}
				}).catch(() => {
					this.$message.error('请求失败')
				})
			},
			//监听pagesize改变事件
			handleSizeChange(newSize) {
				this.queryInfo.pagesize = newSize
				this.getCateList()
			},
			//监听pagenum改变事件
			handleCurrentChange(newPage) {
				this.queryInfo.pagenum = newPage
				this.getCateList()
			},
			//显示添加分类对话框
			showAddCateDialog() {
				this.getParentCateList()
				this.addCateDialogVisible = true
			},
			//获取父级分类的数据列表
			getParentCateList() {
				axios.get('categories', {params: {type: 2}}).then(response => {
					const res = response.data
					if (res.meta.status === 200) {
						this.parentCateList = res.data
					} else {
						this.$message.error(res.meta.msg)
					}
				}).catch(() => {
					this.$message.error('请求失败')
				})
			},
			//选择项发生变化
			parentCateChange() {
				//如果 selectedKeys 数组中的 length 大于0 则选中了父级分类，否则为没有选中任何父级分类
				if (this.selectedKeys.length > 0) {
					//父级分类的id
					this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
					//当前添加的分类等级
					this.addCateForm.cat_level = this.selectedKeys.length
				} else {
					//父级分类的id
					this.addCateForm.cat_pid = 0
					//当前添加的分类等级
					this.addCateForm.cat_level = 0
				}
			},
			//监听添加分类对话框关闭事件
			addCateDialogClosed() {
				this.$refs.addCateFormRef.resetFields()
				this.selectedKeys = []
				this.addCateForm.cat_pid = 0
				this.addCateForm.cat_level = 0
			},
			//确定添加分类
			addCate() {
				this.$refs.addCateFormRef.validate(valid => {
					if (valid) {
						axios.post('categories', this.addCateForm).then(response => {
							const res = response.data
							if (res.meta.status === 201) {
								this.$message.success(res.meta.msg)
								this.getCateList()
								this.addCateDialogVisible = false
							} else {
								this.$message.error(res.meta.msg)
							}
						}).catch(() => {
							this.$message.error('操作失败')
						})
					}
				})
			},
			showEditDialog(cateInfo) {
				this.editCateForm.cat_id = cateInfo.cat_id
				this.editCateForm.cat_name = cateInfo.cat_name
				this.editCateDialogVisible = true
			},
			//监听修改分类对话框关闭事件
			editCateDialogClosed() {
				this.$refs.editCateFormRef.resetFields()
				this.editCateForm.cat_id = 0
				this.editCateForm.cat_name = ''
			},
			//确定修改分类
			editCate() {
				this.$refs.editCateFormRef.validate(valid => {
					if (valid) {
						axios.put(`categories/${this.editCateForm.cat_id}`, {cat_name: this.editCateForm.cat_name}).then(response => {
							const res = response.data
							if (res.meta.status === 200) {
								this.$message.success(res.meta.msg)
								this.getCateList()
								this.editCateDialogVisible = false
							} else {
								this.$message.error(res.meta.msg)
							}
						}).catch(() => {
							this.$message.error('操作失败')
						})
					}
				})
			},
			removeCateById(id) {
				axios.delete(`categories/${id}`).then(response => {
					const res = response.data
					if (res.meta.status === 200) {
						this.$message.success(res.meta.msg)
						this.getCateList()
					} else {
						this.$message.error(res.meta.msg)
					}
				}).catch(() => {
					this.$message.error('操作失败')
				})
			}
		}
	}
</script>

<style scoped>
	.treeTable {
		margin-top: 15px;
		margin-bottom: 15px;
	}

	.el-cascader {
		width: 100%;
	}
	.el-button{
		margin-right: 10px;
	}
</style>
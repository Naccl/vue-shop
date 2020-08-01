<template>
	<div>
		<!--面包屑导航区-->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>商品管理</el-breadcrumb-item>
			<el-breadcrumb-item>分类参数</el-breadcrumb-item>
		</el-breadcrumb>

		<el-card>
			<!--警告提示-->
			<el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" :closable="false" show-icon></el-alert>
			<!--选择商品分类区域-->
			<el-row class="cat_opt">
				<el-col>
					<span>选择商品分类：</span>
					<el-cascader v-model="selectedKeys" :options="cateList" :props="cascaderProps" @change="getParamsData" style="width: 300px"></el-cascader>
				</el-col>
			</el-row>
			<!-- tab标签页 -->
			<el-tabs v-model="activeName" @tab-click="getParamsData">
				<el-tab-pane label="动态参数" name="many">
					<el-button type="primary" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加参数</el-button>
					<el-table :data="manyTableData" border stripe>
						<el-table-column type="expand">
							<template v-slot="scope">
								<!--循环渲染tag标签-->
								<el-tag v-for="(item,index) in scope.row.attr_vals" :key="index" closable @close="handleTagClose(scope.row,index)">{{ item }}</el-tag>
								<!--添加tag标签-->
								<el-input class="input-new-tag" v-if="scope.row.inputTagVisible" v-model="scope.row.inputTagValue" ref="saveTagInput"
								          size="small" @keyup.enter.native="handleInputTagConfirm(scope.row)" @blur="handleInputTagConfirm(scope.row)"></el-input>
								<el-button v-else class="button-new-tag" size="small" @click="showTagInput(scope.row)">+ New Tag</el-button>
							</template>
						</el-table-column>
						<el-table-column label="序号" type="index" width="50"></el-table-column>
						<el-table-column label="参数名称" prop="attr_name"></el-table-column>
						<el-table-column label="操作">
							<template v-slot="scope">
								<el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row)">编辑</el-button>
								<el-popconfirm title="确定删除吗？" icon="el-icon-delete" iconColor="red" @onConfirm="removeParamsById(scope.row.attr_id)">
									<el-button size="mini" type="danger" icon="el-icon-delete" slot="reference">删除</el-button>
								</el-popconfirm>
							</template>
						</el-table-column>
					</el-table>
				</el-tab-pane>
				<el-tab-pane label="静态属性" name="only">
					<el-button type="primary" :disabled="isBtnDisabled" @click="addDialogVisible=true">添加属性</el-button>
					<el-table :data="onlyTableData" border stripe>
						<el-table-column type="expand">
							<template v-slot="scope">
								<!--循环渲染tag标签-->
								<el-tag v-for="(item,index) in scope.row.attr_vals" :key="index" closable @close="handleTagClose(scope.row,index)">{{ item }}</el-tag>
								<!--添加tag标签-->
								<el-input class="input-new-tag" v-if="scope.row.inputTagVisible" v-model="scope.row.inputTagValue" ref="saveTagInput"
								          size="small" @keyup.enter.native="handleInputTagConfirm(scope.row)" @blur="handleInputTagConfirm(scope.row)"></el-input>
								<el-button v-else class="button-new-tag" size="small" @click="showTagInput(scope.row)">+ New Tag</el-button>
							</template>
						</el-table-column>
						<el-table-column label="序号" type="index" width="50"></el-table-column>
						<el-table-column label="属性名称" prop="attr_name"></el-table-column>
						<el-table-column label="操作">
							<template v-slot="scope">
								<el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row)">编辑</el-button>
								<el-popconfirm title="确定删除吗？" icon="el-icon-delete" iconColor="red" @onConfirm="removeParamsById(scope.row.attr_id)">
									<el-button size="mini" type="danger" icon="el-icon-delete" slot="reference">删除</el-button>
								</el-popconfirm>
							</template>
						</el-table-column>
					</el-table>
				</el-tab-pane>
			</el-tabs>
		</el-card>

		<!--添加参数的对话框-->
		<el-dialog :title="'添加'+titleText" width="50%" :visible.sync="addDialogVisible" :close-on-click-modal="false" @close="addDialogClosed">
			<!--内容主体-->
			<el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
				<el-form-item :label="titleText" prop="attr_name">
					<el-input v-model="addForm.attr_name"></el-input>
				</el-form-item>
			</el-form>
			<!--底部-->
			<span slot="footer">
				<el-button @click="addDialogVisible=false">取 消</el-button>
				<el-button type="primary" @click="addParams">确 定</el-button>
			</span>
		</el-dialog>

		<!--修改参数的对话框-->
		<el-dialog :title="'修改'+titleText" width="50%" :visible.sync="editDialogVisible" :close-on-click-modal="false" @close="editDialogClosed">
			<!--内容主体-->
			<el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px">
				<el-form-item :label="titleText" prop="attr_name">
					<el-input v-model="editForm.attr_name"></el-input>
				</el-form-item>
			</el-form>
			<!--底部-->
			<span slot="footer">
				<el-button @click="editDialogVisible=false">取 消</el-button>
				<el-button type="primary" @click="editParams">确 定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
	export default {
		name: "Params",
		data() {
			return {
				//商品分类列表
				cateList: [],
				//指定级联选择器的配置对象
				cascaderProps: {
					expandTrigger: 'hover',
					value: 'cat_id',
					label: 'cat_name',
					children: 'children'
				},
				//级联选择框选中的数组
				selectedKeys: [],
				//被激活的tab名称
				activeName: 'many',
				//动态参数数据列表
				manyTableData: [],
				//静态属性数据列表
				onlyTableData: [],
				//添加属性对话框显示状态
				addDialogVisible: false,
				addForm: {
					attr_name: ''
				},
				addFormRules: {
					attr_name: [
						{required: true, message: '请输入参数名称', trigger: 'blur'}
					]
				},
				editDialogVisible: false,
				editForm: {},
				editFormRules: {
					attr_name: [
						{required: true, message: '请输入参数名称', trigger: 'blur'}
					]
				},
			}
		},
		created() {
			this.getCateList()
		},
		methods: {
			//获取商品分类数据
			getCateList() {
				axios.get('categories').then(response => {
					const res = response.data
					if (res.meta.status === 200) {
						this.cateList = res.data
					} else {
						this.$message.error(res.meta.msg)
					}
				}).catch(() => {
					this.$message.error('请求失败')
				})
			},
			//获取参数的列表数据
			getParamsData() {
				//必须选中三级分类
				if (this.selectedKeys.length === 3) {
					//根据所选分类的id，和当前所处的面板，获取对应的参数
					axios.get(`categories/${this.cateId}/attributes`, {params: {sel: this.activeName}}).then(response => {
						const res = response.data
						res.data.forEach(item => {
							item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
							//添加tag的显示状态
							item.inputTagVisible = false
							//添加tag的值
							item.inputTagValue = ''
						})
						if (res.meta.status === 200) {
							if (this.activeName === 'many') {
								this.manyTableData = res.data
							} else if (this.activeName === 'only') {
								this.onlyTableData = res.data
							}
						} else {
							this.$message.error(res.meta.msg)
						}
					}).catch(() => {
						this.$message.error('请求失败')
					})
				} else {
					this.selectedKeys = []
					this.manyTableData = []
					this.onlyTableData = []
				}
			},
			addDialogClosed() {
				this.$refs.addFormRef.resetFields()
			},
			//确定添加参数
			addParams() {
				this.$refs.addFormRef.validate(valid => {
					if (valid) {
						axios.post(`categories/${this.cateId}/attributes`, {
							attr_name: this.addForm.attr_name,
							attr_sel: this.activeName
						}).then(response => {
							const res = response.data
							if (res.meta.status === 201) {
								this.$message.success(res.meta.msg)
								this.getParamsData()
								this.addDialogVisible = false
							} else {
								this.$message.error(res.meta.msg)
							}
						}).catch(() => {
							this.$message.error('操作失败')
						})
					}
				})
			},
			showEditDialog(paramsInfo) {
				//paramsInfo中没有对象，直接深拷贝一份，也没必要从服务端重新获取了
				//如果直接赋值，则为引用，表格上的数据也会随对话框中数据的修改而实时改变
				this.editForm = {...paramsInfo}
				this.editDialogVisible = true
			},
			editDialogClosed() {
				this.$refs.editFormRef.resetFields()
			},
			editParams() {
				this.$refs.editFormRef.validate(valid => {
					if (valid) {
						axios.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
							attr_name: this.editForm.attr_name,
							attr_sel: this.activeName
						}).then(response => {
							const res = response.data
							if (res.meta.status === 200) {
								this.$message.success(res.meta.msg)
								this.getParamsData()
								this.editDialogVisible = false
							} else {
								this.$message.error(res.meta.msg)
							}
						}).catch(() => {
							this.$message.error('操作失败')
						})
					}
				})
			},
			removeParamsById(id) {
				axios.delete(`categories/${this.cateId}/attributes/${id}`).then(response => {
					const res = response.data
					if (res.meta.status === 200) {
						this.$message.success(res.meta.msg)
						this.getParamsData()
					} else {
						this.$message.error(res.meta.msg)
					}
				}).catch(() => {
					this.$message.error('操作失败')
				})
			},
			//确定添加tag
			handleInputTagConfirm(row) {
				if (row.inputTagValue.trim().length !== 0) {
					//将新添加的tag push进数组
					row.attr_vals.push(row.inputTagValue.trim())
					//向服务端put新数据
					this.saveAttrVals(row)
				}
				row.inputTagValue = ''
				row.inputTagVisible = false
			},
			//将 attr_vals 保存到服务端
			saveAttrVals(row) {
				axios.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
					attr_name: row.attr_name,
					attr_sel: row.attr_sel,
					attr_vals: row.attr_vals.join(',')
				}).then(response => {
					const res = response.data
					if (res.meta.status === 200) {
						this.$message.success(res.meta.msg)
					} else {
						this.$message.error(res.meta.msg)
					}
				}).catch(() => {
					this.$message.error('操作失败')
				})
			},
			//显示tag输入框
			showTagInput(row) {
				row.inputTagVisible = true
				//让输入框自动获得焦点
				//$nextTick方法的作用，当页面上元素被重新渲染之后，才执行回调函数
				//当设置row.inputTagVisible = true，需要将tag渲染成input输入框，在渲染完成之前，获取不到this.$refs.saveTagInput.$refs.input
				this.$nextTick(_ => {
					this.$refs.saveTagInput.$refs.input.focus();
				});
			},
			//删除tag
			handleTagClose(row, index) {
				row.attr_vals.splice(index, 1)
				//向服务端put新数据
				this.saveAttrVals(row)
			}
		},
		computed: {
			isBtnDisabled() {
				return this.selectedKeys.length !== 3;
			},
			//当前选中的三级分类的id
			cateId() {
				if (this.selectedKeys.length === 3) {
					return this.selectedKeys[2]
				}
				return null
			},
			//动态计算标题的文本
			titleText() {
				if (this.activeName === 'many') {
					return '动态参数'
				} else {
					return '静态属性'
				}
			}
		}
	}
</script>

<style lang="less" scoped>
	.cat_opt {
		margin: 15px 0;
	}

	.el-button {
		margin-right: 10px;
	}

	.el-tag {
		margin: 10px;
	}

	.input-new-tag {
		width: 120px;
	}

	.button-new-tag {
		width: 120px;
	}
</style>
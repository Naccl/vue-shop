<template>
	<div>
		<!--面包屑导航区-->
		<el-breadcrumb separator-class="el-icon-arrow-right">
			<el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
			<el-breadcrumb-item>权限管理</el-breadcrumb-item>
			<el-breadcrumb-item>角色列表</el-breadcrumb-item>
		</el-breadcrumb>

		<!--卡片视图区域-->
		<el-card>
			<!--添加角色按钮-->
			<el-row>
				<el-col>
					<el-button type="primary" @click="addRoleDialogVisible=true">添加角色</el-button>
				</el-col>
			</el-row>

			<!--角色列表-->
			<el-table :data="roleList" :border="true" :stripe="true">
				<el-table-column type="expand" width="50">
					<template v-slot="scope">
						<el-row :class="['bdbottom',index1===0?'bdtop':'','vcenter']" v-for="(item1,index1) in scope.row.children" :key="item1.id">
							<!-- 一级权限 -->
							<el-col :span="5">
								<el-tag :closable="true" @close="removeRightById(scope.row,item1.id)">{{ item1.authName }}</el-tag>
								<i class="el-icon-caret-right"></i>
							</el-col>
							<!-- 二级和三级权限 -->
							<el-col :span="19">
								<el-row :class="[index2!==0?'bdtop':'','vcenter']" v-for="(item2,index2) in item1.children" :key="item2.id">
									<el-col :span="6">
										<el-tag type="success" :closable="true" @close="removeRightById(scope.row,item2.id)">{{ item2.authName }}</el-tag>
										<i class="el-icon-caret-right"></i>
									</el-col>
									<el-col :span="18">
										<el-tag type="warning" v-for="(item3) in item2.children" :key="item3.id" :closable="true" @close="removeRightById(scope.row,item3.id)">
											{{ item3.authName }}
										</el-tag>
									</el-col>
								</el-row>
							</el-col>
						</el-row>
					</template>
				</el-table-column>
				<el-table-column label="序号" type="index" width="50"></el-table-column>
				<el-table-column label="角色名称" prop="roleName"></el-table-column>
				<el-table-column label="角色描述" prop="roleDesc"></el-table-column>
				<el-table-column label="操作" width="300">
					<template v-slot="scope">
						<el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)">编辑</el-button>
						<el-button size="mini" type="danger" icon="el-icon-delete" @click="removeRoleById(scope.row.id)">删除</el-button>
						<el-button size="mini" type="warning" icon="el-icon-setting" @click="showSetRightDialog(scope.row)">分配权限</el-button>
					</template>
				</el-table-column>
			</el-table>
		</el-card>

		<!--添加角色的对话框-->
		<el-dialog title="添加角色" width="50%" :visible.sync="addRoleDialogVisible" :close-on-click-modal="false" @close="addRoleDialogClosed">
			<!--内容主体-->
			<el-form :model="addRoleForm" :rules="addRoleFormRules" ref="addRoleFormRef" label-width="80px">
				<el-form-item label="角色名称" prop="roleName">
					<el-input v-model="addRoleForm.roleName"></el-input>
				</el-form-item>
				<el-form-item label="角色描述" prop="roleDesc">
					<el-input v-model="addRoleForm.roleDesc"></el-input>
				</el-form-item>
			</el-form>
			<!--底部-->
			<span slot="footer">
				<el-button @click="addRoleDialogVisible=false">取 消</el-button>
				<el-button type="primary" @click="addRole">确 定</el-button>
			</span>
		</el-dialog>
		
		<!--修改角色的对话框-->
		<el-dialog title="修改角色" width="50%" :visible.sync="editRoleDialogVisible" :close-on-click-modal="false" @close="editRoleDialogClosed">
			<!--内容主体-->
			<el-form :model="editRoleForm" :rules="editRoleFormRules" ref="editRoleFormRef" label-width="80px">
				<el-form-item label="角色名称" prop="roleName">
					<el-input v-model="editRoleForm.roleName"></el-input>
				</el-form-item>
				<el-form-item label="角色描述" prop="roleDesc">
					<el-input v-model="editRoleForm.roleDesc"></el-input>
				</el-form-item>
			</el-form>
			<!--底部-->
			<span slot="footer">
				<el-button @click="editRoleDialogVisible=false">取 消</el-button>
				<el-button type="primary" @click="editRole">确 定</el-button>
			</span>
		</el-dialog>

		<!--分配权限的对话框-->
		<el-dialog title="分配权限" width="30%" :visible.sync="setRightDialogVisible" :close-on-click-modal="false" @close="setRightsDialogClosed">
			<!--内容主体-->
			<el-tree :data="rightsList" :props="treeProps" ref="treeRef" :show-checkbox="true" :default-expand-all="true"
			         node-key="id" :default-checked-keys="defaultKeys"></el-tree>
			<!--底部-->
			<span slot="footer">
				<el-button @click="setRightDialogVisible=false">取 消</el-button>
				<el-button type="primary" @click="allotRights">确 定</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
	export default {
		name: "Roles",
		data() {
			return {
				//角色列表
				roleList: [],
				//分配权限对话框的显示与隐藏
				setRightDialogVisible: false,
				//所有权限的树形数据
				rightsList: [],
				//树形控件的属性绑定对象
				treeProps: {
					label: 'authName',
					children: 'children'
				},
				//默认选中的节点id值数组
				defaultKeys: [],
				//当前即将分配权限的角色id
				roleId: '',
				//添加角色对话框的显示状态
				addRoleDialogVisible: false,
				//修改角色对话框的显示状态
				editRoleDialogVisible: false,
				//添加角色的表单数据
				addRoleForm: {
					roleName: '',
					roleDesc: '',
				},
				//添加角色表单的验证规则对象
				addRoleFormRules: {
					roleName: [
						{required: true, message: '请输入角色名称', trigger: 'blur'},
					],
					roleDesc: [
						{required: true, message: '请输入角色描述', trigger: 'blur'},
					]
				},
				//修改角色的表单数据
				editRoleForm: {
					roleName: '',
					roleDesc: '',
				},
				//修改角色表单的验证规则对象
				editRoleFormRules: {
					roleName: [
						{required: true, message: '请输入角色名称', trigger: 'blur'},
					],
					roleDesc: [
						{required: true, message: '请输入角色描述', trigger: 'blur'},
					]
				},
			}
		},
		created() {
			this.getRolesList()
		},
		methods: {
			getRolesList() {
				axios.get('roles').then(response => {
					const res = response.data
					if (res.meta.status === 200) {
						this.roleList = res.data
					} else {
						this.$message.error(res.meta.msg)
					}
				}).catch(() => {
					this.$message.error('请求失败')
				})
			},
			//根据id删除角色对应的权限
			removeRightById(role, rightId) {
				this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					axios.delete(`roles/${role.id}/rights/${rightId}`).then(response => {
						const res = response.data
						if (res.meta.status === 200) {
							role.children = res.data
							this.$message.success(res.meta.msg)
						} else {
							this.$message.error(res.meta.msg)
						}
					}).catch(() => {
						this.$message.error('操作失败')
					})
				}).catch(() => {
					this.$message.info('已取消删除')
				});
			},
			//显示分配权限对话框
			showSetRightDialog(role) {
				this.roleId = role.id
				axios.get('rights/tree').then(response => {
					const res = response.data
					if (res.meta.status === 200) {
						this.rightsList = res.data
						this.getLeafKeys(role, this.defaultKeys)
						this.setRightDialogVisible = true
					} else {
						this.$message.error(res.meta.msg)
					}
				}).catch(() => {
					this.$message.error('请求失败')
				})
			},
			//通过递归方式 获取角色下所有三级权限的id
			getLeafKeys(node, arr) {
				//如果当前node节点不含children属性 则为三级节点
				if (!node.children) {
					return arr.push(node.id)
				}
				node.children.forEach(item => this.getLeafKeys(item, arr))
			},
			//分配权限对话框关闭事件
			setRightsDialogClosed() {
				this.defaultKeys = []
			},
			//为角色分配权限
			allotRights() {
				const keys = [
					...this.$refs.treeRef.getCheckedKeys(),
					...this.$refs.treeRef.getHalfCheckedKeys()
				]
				const idStr = keys.join(',')
				axios.post(`roles/${this.roleId}/rights`, {rids: idStr}).then(response => {
					const res = response.data
					if (res.meta.status === 200) {
						this.getRolesList()
						this.setRightDialogVisible = false
						this.$message.success(res.meta.msg)
					} else {
						this.$message.error(res.meta.msg)
					}
				}).catch(() => {
					this.$message.error('操作失败')
				})
			},
			//添加角色对话框的关闭事件
			addRoleDialogClosed() {
				this.$refs.addRoleFormRef.resetFields()
			},
			//确认添加角色
			addRole(){
				this.$refs.addRoleFormRef.validate(valid => {
					if (valid) {
						axios.post('roles', this.addRoleForm).then(response => {
							const res = response.data
							if (res.meta.status === 201) {
								//隐藏对话框
								this.addRoleDialogVisible = false
								this.getRolesList()
								this.$message.success(res.meta.msg)
							} else {
								this.$message.error(res.meta.msg)
							}
						}).catch(() => {
							this.$message.error("操作失败")
						})
					}
				})
			},
			showEditDialog(id){
				axios.get(`roles/${id}`).then(response => {
					const res = response.data
					if (res.meta.status === 200) {
						this.editRoleForm = res.data
					} else {
						return this.$message.error(res.meta.msg)
					}
				}).catch(() => {
					return this.$message.error("请求失败")
				})
				this.editRoleDialogVisible = true
			},
			//修改角色对话框的关闭事件
			editRoleDialogClosed() {
				this.$refs.editRoleFormRef.resetFields()
			},
			//确认修改角色
			editRole(){
				this.$refs.editRoleFormRef.validate(valid => {
					if (valid) {
						axios.put(`roles/${this.editRoleForm.roleId}`, this.editRoleForm).then(response => {
							const res = response.data
							if (res.meta.status === 200) {
								//隐藏对话框
								this.editRoleDialogVisible = false
								this.getRolesList()
								this.$message.success(res.meta.msg)
							} else {
								this.$message.error(res.meta.msg)
							}
						}).catch(() => {
							this.$message.error("操作失败")
						})
					}
				})
			},
			//根据id删除对应的角色
			removeRoleById(id) {
				this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					axios.delete(`roles/${id}`).then(response => {
						const res = response.data
						if (res.meta.status === 200) {
							this.$message.success(res.meta.msg)
							this.getRolesList()
						} else {
							this.$message.error(res.meta.msg)
						}
					}).catch(() => {
						this.$message.error('操作失败')
					})
				}).catch(() => {
					this.$message.info('已取消删除')
				});
			},
		}
	}
</script>

<style lang="less" scoped>
	.el-tag {
		margin: 10px;
	}

	.bdtop {
		border-top: 1px solid #eeeeee;
	}

	.bdbottom {
		border-bottom: 1px solid #eeeeee;
	}

	.vcenter {
		display: flex;
		align-items: center;
	}
</style>
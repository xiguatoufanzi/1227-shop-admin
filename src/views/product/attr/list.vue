<template>
  <div>
    <el-card>
      <CategorySelector @categoryChange="handleCategoryChange" />
    </el-card>
    <el-card>
      <div v-show="isShowList">
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="showAdd"
          :disabled="!category3Id"
          >添加属性</el-button
        >

        <el-table border :data="attrs">
          <el-table-column
            label="序号"
            type="index"
            width="80"
            align="center"
          ></el-table-column>
          <el-table-column label="属性名称" width="150" prop="attrName">
          </el-table-column>
          <el-table-column label="属性值列表">
            <template slot-scope="{ row, $index }">
              <el-tag
                style="margin: 2px"
                type="info"
                v-for="value in row.attrValueList"
                :key="value.id"
                >{{ value.valueName }}</el-tag
              >
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template slot-scope="{ row, $index }">
              <HintButton
                title="修改"
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="showUpdate(row)"
              ></HintButton>
              <el-popconfirm
                :title="`确定删除属性${row.attrName}吗?`"
                @onConfirm="delAttr(row)"
              >
                <HintButton
                  title="删除"
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  slot="reference"
                ></HintButton>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div v-show="!isShowList">
        <el-form :inline="true" :model="attr" class="demo-form-inline">
          <el-form-item label="属性名">
            <el-input
              v-model="attr.attrName"
              placeholder="请输入属性名"
            ></el-input>
          </el-form-item>
        </el-form>

        <el-button
          type="primary"
          icon="el-icon-plus"
          :disabled="!attr.attrName"
          @click="addAttrValue"
          >添加属性值</el-button
        >
        <el-button @click="isShowList = true">取消</el-button>

        <el-table border style="margin: 20px 0" :data="attr.attrValueList">
          <el-table-column label="序号" type="index" width="80" align="center">
          </el-table-column>
          <el-table-column label="属性值名称">
            <template slot-scope="{ row, $index }">
              <el-input
                v-if="row.edit"
                v-model="row.valueName"
                size="mini"
                placeholder="请输入属性值名称"
                @blur="toShow(row)"
                @keyup.enter.native="toShow(row)"
              ></el-input>
              <span
                v-else
                @click="toEdit(row)"
                style="display:inline-block;width: 100%"
                >{{ row.valueName }}</span
              >
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="{ row, $index }">
              <el-popconfirm
                :title="`确定删除属性值${row.valueName}吗？`"
                @onConfirm="attr.attrValueList.splice($index, 1)"
              >
                <HintButton
                  slot="reference"
                  title="删除"
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                ></HintButton>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>

        <el-button type="primary" @click="saveAttr">保存</el-button>
        <el-button @click="isShowList = true">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import cloneDeep from "lodash/cloneDeep";
export default {
  name: "AttrList",

  data() {
    return {
      category1Id: "", // 一级分类ID
      category2Id: "", // 二级分类ID
      category3Id: "", // 三级分类ID
      attrs: [], // 所有属性的列表

      isShowList: true, // 是否显示属性列表页面   true: 列表页面, false: 添加或更新页面

      attr: {
        attrName: "", // 属性名
        attrValueList: [], //属性值的列表
        categoryId: "", // 3级的分类ID
        categoryLevel: 3 // 只能是3级
      },

      isShowSave: true
    };
  },

  mounted() {
    // this.$API.attr.getList(2, 13, 61);
    this.category1Id = 2;
    this.category2Id = 13;
    this.category3Id = 61;
    this.getAttrs();
  },

  methods: {
    //删除属性
    async delAttr(value) {
      const result = await this.$API.attr.remove(value.id);
      if (result.code === 200) {
        this.getAttrs();
        this.$message.success("删除成功");
      }
    },

    //保存属性
    async saveAttr() {
      const result = await this.$API.attr.addOrUpdate(this.attr);
      if (result.code === 200) {
        this.isShowList = true;
        this.getAttrs();
        this.$message.success("保存成功");
      }
    },

    //将指定属性值对象的界面变为编辑模式
    toEdit(value) {
      if (value.hasOwnProperty("edit")) {
        value.edit = true;
      } else {
        this.$set(value, "edit", true);
      }
    },

    //将指定属性值对象的界面变为查看模式
    toShow(value) {
      if (value.valueName) {
        const isRepeat = this.attr.attrValueList.some((item, index) => {
          if (value !== item) {
            return item.valueName === value.valueName;
          }
        });
        if (!isRepeat) {
          value.edit = false;
        } else {
          // 如果已经有了
          value.valueName = ""; // 清除输入
          this.$message.warning("输入的名称已存在");
        }
      }
    },

    //显示添加属性的界面
    showAdd() {
      // 重置attr对象
      this.attr = {
        attrName: "",
        attrValueList: [],
        categoryId: this.category3Id,
        categoryLevel: 3
      };
      // 显示添加的界面
      this.isShowList = false;
    },

    //显示修改属性的界面
    showUpdate(attr) {
      // 保存要修改的属性对象
      // this.attr = { ...attr }; 浅拷贝属性值点取消有bug
      this.attr = cloneDeep(attr);
      // 显示更新的界面(attr中有数据)
      this.isShowList = false;
    },

    //添加一个新的属性值
    addAttrValue() {
      this.attr.attrValueList.push({
        attrId: this.attr.id, // 有值则为修改属性
        valueName: "",
        edit: true // 添加的新属性值是编辑模式的
      });
    },

    //3个级别分类发生改变时的监听回调
    handleCategoryChange({ categoryId, level }) {
      if (level === 1) {
        this.category1Id = categoryId;
        // 重置2级和3级ID和属性列表
        this.category2Id = "";
        this.category3Id = "";
        this.attrs = [];
      } else if (level === 2) {
        this.category2Id = categoryId;
        // 重置3级ID和属性列表
        this.category3Id = "";
        this.attrs = [];
      } else {
        this.category3Id = categoryId;
        // 异步请求获取属性列表显示
        this.getAttrs();
      }
    },

    //异步请求获取属性列表显示
    async getAttrs() {
      const { category1Id, category2Id, category3Id } = this;
      const result = await this.$API.attr.getList(
        category1Id,
        category2Id,
        category3Id
      );
      this.attrs = result.data;
    }
  }
};
</script>

<style scoped>
.edit-input {
  padding-right: 60px;
}
.save-btn {
  position: absolute;
  right: 15px;
  top: 10px;
}
</style>

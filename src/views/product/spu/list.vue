<template>
  <div>
    <el-card style="margin-bottom: 20px">
      <CategorySelector @categoryChange="handleCategoryChange" />
    </el-card>

    <el-card style="margin-bottom: 20px">
      <el-button type="primary" icon="el-icon-plus" style="margin-bottom:20px"
        >添加SPU</el-button
      >

      <el-table border :data="spuList" stripe v-loading="loading">
        <el-table-column
          label="序号"
          type="index"
          width="80"
          align="center"
        ></el-table-column>
        <el-table-column label="SPU名称" prop="spuName"> </el-table-column>
        <el-table-column label="SPU描述" prop="description"> </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="{ row, $index }">
            <HintButton
              title="添加"
              type="primary"
              icon="el-icon-plus"
              size="mini"
            ></HintButton>
            <HintButton
              title="修改"
              type="primary"
              icon="el-icon-edit"
              size="mini"
            ></HintButton>
            <HintButton
              title="查看已有SKU"
              type="info"
              icon="el-icon-info"
              size="mini"
            ></HintButton>
            <el-popconfirm :title="`确定删除属性 吗?`">
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

      <el-pagination
        style="text-align:center; margin-top:20px;"
        background
        :current-page="page"
        :page-sizes="[3, 6, 9, 12]"
        :page-size="limit"
        layout=" prev, pager, next, jumper, ->, sizes, total"
        :total="total"
        @current-change="getSpuList"
        @size-change="handleSizeChange"
      >
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  name: "SpuList",

  data() {
    return {
      spuList: [],
      category1Id: "", // 一级分类ID
      category2Id: "", // 二级分类ID
      category3Id: "", // 三级分类ID

      page: 1,
      limit: 3,
      total: 0,

      loading: false
    };
  },

  methods: {
    //选择新的分类的监听回调
    handleCategoryChange({ categoryId, level }) {
      if (level === 1) {
        this.category1Id = categoryId;
        this.category2Id = "";
        this.category3Id = "";
        this.spuList = [];
        this.total = 0;
      } else if (level === 2) {
        this.category2Id = categoryId;
        this.category3Id = "";
        this.spuList = [];
        this.total = 0;
      } else {
        this.category3Id = categoryId;
        //发送分页列表数据请求
        this.getSpuList();
      }
    },

    //获取指定页码的列表数据
    async getSpuList(page = 1) {
      const { limit, category3Id } = this;
      const result = await this.$API.spu.getList(page, limit, category3Id);
      if (result.code === 200) {
        const { records, total } = result.data;
        this.spuList = records;
        this.total = total;
      }
    },

    //每页数量发生改变的监听回调
    handleSizeChange(pageSize) {
      this.limit = pageSize;
      this.getSpuList();
    }
  }
};
</script>

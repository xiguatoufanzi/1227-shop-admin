<template>
  <el-card>
    <el-table border :data="skuList" v-loading="loading">
      <el-table-column type="index" label="序号" width="80" align="center">
      </el-table-column>
      <el-table-column label="名称" prop="skuName"> </el-table-column>
      <el-table-column label="描述" prop="skuDesc"> </el-table-column>
      <el-table-column label="默认图片" width="150">
        <template slot-scope="{ row }">
          <img :src="row.skuDefaultImg" style="width: 80px;" />
        </template>
      </el-table-column>
      <el-table-column label="重量(KG)" prop="weight"> </el-table-column>
      <el-table-column label="价格" width="80" prop="price"> </el-table-column>
      <el-table-column label="操作" width="250">
        <template slot-scope="{ row }">
          <HintButton
            title="下架"
            type="warning"
            size="mini"
            icon="el-icon-bottom"
          ></HintButton>
          <HintButton
            title="修改"
            type="primary"
            size="mini"
            icon="el-icon-edit"
          ></HintButton>
          <HintButton
            title="查看详情"
            type="primary"
            size="mini"
            icon="el-icon-info"
          ></HintButton>
          <el-popconfirm title="确定删除吗?">
            <HintButton
              title="删除"
              type="danger"
              size="mini"
              icon="el-icon-delete"
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
      :page-sizes="[5, 10, 20]"
      :page-size="limit"
      layout=" prev, pager, next, jumper, ->, sizes, total"
      :total="total"
      @current-change="getSkuList"
      @size-change="handleSizeChange"
    >
    </el-pagination>
  </el-card>
</template>

<script>
export default {
  name: "SkuList",

  data() {
    return {
      skuList: [], // SKU列表
      loading: false, // 是否正在加载中

      total: 0, // 总数量
      page: 1, // 当前页码
      limit: 10 // 每页数量
    };
  },

  mounted() {
    this.getSkuList();
  },

  methods: {
    //异步获取指定页码的sku列表
    async getSkuList(page = 1) {
      this.page = page;
      this.loading = true;
      const result = await this.$API.sku.getList(this.page, this.limit);
      if (result.code === 200) {
        this.skuList = result.data.records;
        this.total = result.data.total;
        this.loading = false;
      }
    },

    //页面显示个数变化调用
    handleSizeChange(size) {
      this.limit = size;
      this.getSkuList();
    }
  }
};
</script>

<style lang="less" scoped></style>

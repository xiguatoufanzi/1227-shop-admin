<template>
  <div>
    <el-card style="margin-bottom: 20px">
      <CategorySelector @categoryChange="handleCategoryChange" />
    </el-card>

    <el-card style="margin-bottom: 20px">
      <div v-show="!isShowSpuForm && !isShowSkuForm">
        <el-button
          type="primary"
          icon="el-icon-plus"
          style="margin-bottom:20px"
          @click="showAddSpu"
          >添加SPU</el-button
        >

        <el-table border :data="spuList" v-loading="loading">
          <el-table-column
            label="序号"
            type="index"
            width="80"
            align="center"
          ></el-table-column>
          <el-table-column label="SPU名称" prop="spuName"> </el-table-column>
          <el-table-column label="SPU描述" prop="description">
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="{ row, $index }">
              <HintButton
                title="添加SKU"
                type="primary"
                icon="el-icon-plus"
                size="mini"
                @click="showSkuAdd"
              ></HintButton>
              <HintButton
                title="修改SPU"
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="showUpdateSpu(row.id)"
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
      </div>

      <SpuForm ref="spuForm" :visible.sync="isShowSpuForm"></SpuForm>
      <SkuForm v-show="isShowSkuForm"></SkuForm>
    </el-card>
  </div>
</template>

<script>
import SpuForm from "../components/SpuForm";
import SkuForm from "../components/SkuForm";
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

      loading: false,

      isShowSpuForm: false, // 是否显示spuForm界面
      isShowSkuForm: false // 是否显示skuForm界面
    };
  },

  mounted() {
    this.category3Id = 61;
    this.getSpuList();
  },

  methods: {
    //显示SKU添加的表单界面
    showSkuAdd() {
      this.isShowSkuForm = true;
    },

    //显示SPU的添加界面
    showAddSpu() {
      this.isShowSpuForm = true;
      this.$refs.spuForm.initLoadAddData();
    },

    //显示SPU的修改界面
    showUpdateSpu(id) {
      this.isShowSpuForm = true;
      //传入id，让spu获取初始数据
      this.$refs.spuForm.initLoadUpdateData(id);
    },

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
  },

  components: {
    SpuForm,
    SkuForm
  }
};
</script>

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
                @click="showSkuList(row)"
              ></HintButton>
              <el-popconfirm :title="`确定删除吗?`" @onConfirm="delSpu(row)">
                <HintButton
                  title="删除SPU"
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

      <SpuForm
        ref="spuForm"
        :visible.sync="isShowSpuForm"
        @saveEnd="getSpuList()"
      ></SpuForm>
      <SkuForm :visible.sync="isShowSkuForm"></SkuForm>
    </el-card>

    <el-dialog :title="spuName + '->SKU列表'" :visible.sync="isShowSkuList">
      <el-table :data="skuList">
        <el-table-column label="名称" prop="skuName"></el-table-column>
        <el-table-column label="价格" prop="price"></el-table-column>
        <el-table-column label="重量" prop="weight"></el-table-column>
        <el-table-column label="默认图片">
          <template slot-scope="{ row }">
            <img :src="row.skuDefaultImg" style="height:100px;width:100px" />
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>
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

      spuName: "", //点击的spu名字
      skuList: [], //需要显示的sku列表

      isShowSpuForm: false, // 是否显示spuForm界面
      isShowSkuForm: true, // 是否显示skuForm界面
      isShowSkuList: false // 是否显示skuList界面
    };
  },

  mounted() {
    this.category3Id = 61;
    this.getSpuList();
  },

  methods: {
    //删除spu
    async delSpu(value) {
      const result = await this.$API.spu.remove(value.id);
      if (result.code === 200) {
        this.$message.success("删除成功");
        this.getSpuList();
      } else {
        this.$message.error("删除失败");
      }
    },

    //查看指定的SKU列表
    async showSkuList(value) {
      this.spuName = value.spuName;
      this.isShowSkuList = true;
      const result = await this.$API.sku.getListBySpuId(value.id);
      this.skuList = result.data;
    },

    //显示SKU添加的表单界面
    showSkuAdd() {
      this.isShowSkuForm = true;
    },

    //显示SPU的添加界面
    showAddSpu() {
      const { category3Id } = this;
      this.isShowSpuForm = true;
      this.$refs.spuForm.initLoadAddData(category3Id);
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

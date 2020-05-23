<template>
  <el-form :label-position="labelPosition" label-width="100px" v-show="visible">
    <el-form-item label="SPU名称">
      <el-input placeholder="SPU名称" v-model="spuInfo.spuName"></el-input>
    </el-form-item>
    <el-form-item label="品牌">
      <el-select placeholder="请选择品牌" v-model="spuInfo.tmId">
        <el-option
          v-for="t in trademarkList"
          :key="t.id"
          :label="t.tmName"
          :value="t.id"
        ></el-option>
      </el-select>
    </el-form-item>

    <el-form-item label="SPU描述">
      <el-input
        type="textarea"
        placeholder="SPU描述"
        rows="4"
        v-model="spuInfo.description"
      ></el-input>
    </el-form-item>

    <el-form-item label="SPU图片">
      <el-upload
        :file-list="spuImageList"
        action="/dev-api/admin/product/fileUpload"
        list-type="picture-card"
        :on-preview="handlePictureCardPreview"
        :on-remove="handleRemove"
        :on-success="handleSuccess"
      >
        <i class="el-icon-plus"></i>
      </el-upload>
      <el-dialog :visible.sync="dialogVisible">
        <img width="100%" :src="dialogImageUrl" alt="" />
      </el-dialog>
    </el-form-item>

    <el-form-item label="销售属性">
      <el-select
        :placeholder="
          unUsedSaleAttrList.length > 0
            ? `还有${unUsedSaleAttrList.length}个未使用`
            : '没有啦！'
        "
        v-model="saleId"
      >
        <el-option
          v-for="attr in unUsedSaleAttrList"
          :key="attr.id"
          :label="attr.name"
          :value="attr.id"
        ></el-option>
      </el-select>
      <el-button type="primary" icon="el-icon-plus">添加销售属性</el-button>

      <el-table style="margin-top: 20px" border :data="spuInfo.spuSaleAttrList">
        <!-- 序号列 -->
        <el-table-column label="序号" type="index" width="80" align="center">
        </el-table-column>
        <el-table-column label="属性名" prop="saleAttrName"> </el-table-column>

        <el-table-column label="属性值名称">
          <template slot-scope="{ row, $index }">
            <el-tag
              :key="sAttr.id"
              v-for="sAttr in row.spuSaleAttrValueList"
              closable
              :disable-transitions="false"
              @close="handleClose(sAttr)"
            >
              {{ sAttr.saleAttrValueName }}
            </el-tag>
            <el-input
              class="input-new-tag"
              v-if="row.edit"
              v-model="row.saleAttrValueName"
              ref="saveTagInput"
              size="small"
              @keyup.enter.native="handleInputConfirm"
              @blur="handleInputConfirm"
            >
            </el-input>
            <el-button
              v-else
              class="button-new-tag"
              size="small"
              @click="showInput"
              >+ 添加</el-button
            >
          </template>
        </el-table-column>

        <el-table-column label="操作">
          <template slot-scope="{ row, $index }">
            <el-popconfirm :title="`确定删除属性 吗?`">
              <hint-button
                type="danger"
                title="删除"
                icon="el-icon-delete"
                size="mini"
                slot="reference"
              ></hint-button>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-form-item>

    <el-form-item>
      <el-button type="primary">保存</el-button>
      <el-button @click="back">返回</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: "SpuForm",
  props: {
    visible: Boolean
  },

  data() {
    return {
      labelPosition: "right", //右对齐

      dialogImageUrl: "", // 要显示的大图的url
      dialogVisible: false, // 是否显示大图dialog, 默认不显示

      saleId: "", // 一会要删除
      spuId: "", // 当前要更新的spuInfo的id

      // 当前SpuInfo对象
      spuInfo: {
        spuName: "",
        description: "",
        tmId: "",
        spuSaleAttrList: [], // 必须有初始空数组
        spuImageList: [] // spu销售属性的数组
      },

      spuImageList: [], // Spu的图片列表
      trademarkList: [], //品牌列表
      saleAttrList: [], //销售属性列表

      inputVisible: false,
      inputValue: ""
    };
  },

  computed: {
    // 得到saleAttrList中还没有使用的属性的数组:
    // 只留下没有的spuInfo.spuSaleAttrList中的属性
    unUsedSaleAttrList() {
      return this.saleAttrList.filter(attr => {
        return this.spuInfo.spuSaleAttrList.every(
          spuAttr => spuAttr.saleAttrName !== attr.name
        );
      });
    }
  },

  methods: {
    /*
    上传图片成功后的回调函数
    response: 响应体数据对象, 对应的是axios中的response.data
    file: 新上传成功的图片对象
    fileList: 所有图片对象的数组
    */
    handleSuccess(response, file, fileList) {
      this.spuImageList = fileList;
    },
    /*
    点击删除按钮的回调(并没有发请求)
    file: 被删除图片对象
    fileList: 剩下的所有图片对象的数组
    */
    handleRemove(file, fileList) {
      this.spuImageList = fileList;
    },
    //用来显示大图dialog的回调函数,file: 点击的图片信息对象
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },

    //有关销售属性表格的方法
    handleClose(tag) {
      this.dynamicTags.splice(this.dynamicTags.indexOf(tag), 1);
    },

    showInput() {
      this.inputVisible = true;
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },

    handleInputConfirm() {
      let inputValue = this.inputValue;
      if (inputValue) {
        this.dynamicTags.push(inputValue);
      }
      this.inputVisible = false;
      this.inputValue = "";
    },

    //由父组件调用的方法,请求加载相关数据
    initLoadAddData() {
      this.getTrademarkList();
      this.getSaleAttrList();
    },

    // 由父组件调用的方法,根据id请求加载相关数据
    initLoadUpdateData(spuId) {
      this.spuId = spuId;
      this.getSpuInfo();
      this.getSpuImageList();
      this.getTrademarkList();
      this.getSaleAttrList();
    },

    //根据SPU的id获取SPU的详情信息
    async getSpuInfo() {
      const result = await this.$API.spu.get(this.spuId);
      this.spuInfo = result.data;
    },
    //根据SPU的id获取SPU的图片列表
    async getSpuImageList() {
      const result = await this.$API.sku.getSpuImageList(this.spuId);
      const spuImageList = result.data;
      // 需要对数据进行整理: 给数组元素对象添加name和url属性
      spuImageList.forEach(item => {
        item.name = item.imgName;
        item.url = item.imgUrl;
      });

      // 保存图片列表
      this.spuImageList = spuImageList;
    },
    //获取所有品牌的列表
    async getTrademarkList() {
      const result = await this.$API.trademark.getList();
      this.trademarkList = result.data;
    },
    //获取所有销售属性(id/name)列表
    async getSaleAttrList() {
      const result = await this.$API.spu.getSaleList();
      this.saleAttrList = result.data;
    },

    back() {
      // 分发自定义事件, 让修改页面关闭
      this.$emit("update:visible", false);
    }
  }
};
</script>

<style lang="less" scoped>
.el-tag + .el-tag {
  margin-left: 10px;
}
.button-new-tag {
  margin-left: 10px;
  height: 32px;
  line-height: 30px;
  padding-top: 0;
  padding-bottom: 0;
}
.input-new-tag {
  width: 90px;
  margin-left: 10px;
  vertical-align: bottom;
}
</style>

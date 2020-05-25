<template>
  <el-form :label-position="labelPosition" label-width="80px" v-show="visible">
    <el-form-item label="SPU 名称">
      <span>{{ spu.spuName }}</span>
    </el-form-item>

    <el-form-item label="SPU 名称">
      <el-input placeholder="SKU 名称" v-model="skuInfo.skuName"></el-input>
    </el-form-item>
    <el-form-item label="价格">
      <el-input
        type="number"
        placeholder="SKU 价格"
        v-model="skuInfo.price"
      ></el-input>
    </el-form-item>
    <el-form-item label="重量(千克)">
      <el-input
        type="number"
        placeholder="SKU 重量"
        v-model="skuInfo.weight"
      ></el-input>
    </el-form-item>
    <el-form-item label="规格描述">
      <el-input
        type="textarea"
        placeholder="SKU 规格描述"
        rows="4"
        v-model="skuInfo.skuDesc"
      ></el-input>
    </el-form-item>

    <el-form-item label="平台属性">
      <el-form inline label-width="100px">
        <el-form-item
          style="margin: 5px"
          :label="attr.attrName"
          v-for="attr in attrList"
          :key="attr.id"
        >
          <el-select v-model="attr.attrIdValueId">
            <el-option
              :label="value.valueName"
              :value="attr.id + ':' + value.id"
              v-for="value in attr.attrValueList"
              :key="value.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </el-form-item>

    <el-form-item label="销售属性">
      <el-form inline label-width="100px">
        <el-form-item
          style="margin: 5px"
          :label="attr.saleAttrName"
          v-for="attr in spuSaleAttrList"
          :key="attr.id"
        >
          <el-select v-model="attr.saleAttrValueId">
            <el-option
              :label="value.saleAttrValueName"
              :value="value.id"
              v-for="value in attr.spuSaleAttrValueList"
              :key="value.id"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </el-form-item>

    <el-form-item label="图片列表">
      <el-table
        ref="multipleTable"
        border
        :data="spuImageList"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55"> </el-table-column>
        <el-table-column label="图片">
          <template slot-scope="{ row }">
            <img :src="row.imgUrl" style="width:100px;height:100px;" />
          </template>
        </el-table-column>
        <el-table-column label="名称" prop="imgName"> </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="{ row }">
            <el-tag v-if="row.isDefault === '1'" type="success">默认</el-tag>
            <el-button v-else type="primary" @click="setDefaultImg(row)"
              >设为默认</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-form-item>

    <el-form-item>
      <template slot-scope="{ row }">
        <el-button type="primary" @click="save">保存</el-button>
        <el-button @click="back">返回</el-button>
      </template>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: "SkuForm",
  props: {
    visible: Boolean,
    saveSuccess: Function
  },

  data() {
    return {
      labelPosition: "right",

      spu: {},

      attrList: [], // 平台属性列表
      spuSaleAttrList: [], // spu销售属性列表
      spuImageList: [], // spu图片列表
      selectedSpuImageList: [], // 所有选中的spu图片列表

      skuInfo: {
        // 父组件传过来的
        category3Id: null,
        spuId: null,
        tmId: null,

        // 用户输入自动收集: v-model
        skuName: null,
        skuDesc: "",
        price: null, // 输入后是数字字符串
        weight: null, //  输入后是数字字符串

        // 需要我们写代码去整理
        skuDefaultImg: "", // 默认图片的url
        skuAttrValueList: [], // 收集整理的sku平台属性值列表
        skuSaleAttrValueList: [], // 收集整理的sku销售属性值列表
        skuImageList: [] // 收集整理的sku图片数据列表
      }
    };
  },

  methods: {
    //保存SKU信息
    async save() {
      const { skuInfo, attrList, spuSaleAttrList, selectedSpuImageList } = this;
      // 整理1: skuAttrValueList
      skuInfo.skuAttrValueList = attrList.reduce((pre, attr) => {
        if (attr.attrIdValueId) {
          const [attrId, valueId] = attr.attrIdValueId.split(":");
          pre.push({
            attrId,
            valueId
          });
        }
        return pre;
      }, []);
      // 整理2: skuSaleAttrValueList
      skuInfo.skuSaleAttrValueList = spuSaleAttrList.reduce((pre, attr) => {
        if (attr.saleAttrValueId) {
          pre.push({
            saleAttrValueId: attr.saleAttrValueId
          });
        }
        return pre;
      }, []);
      // 整理3: skuImageList
      skuInfo.skuImageList = selectedSpuImageList.map(image => ({
        imgName: image.imgName,
        imgUrl: image.imgUrl,
        spuImgId: image.id, // 当前Spu图片的id
        isDefault: image.isDefault
      }));

      const result = await this.$API.sku.addUpdate(skuInfo);
      if (result.code === 200) {
        this.$message.success("保存SKU成功");
        // 重置数据
        this.resetData();
        // 通知父组件保存成功
        this.saveSuccess();
      } else {
        this.$message.error("保存sku信息失败");
      }
    },

    //将当前图片设置为默认图片
    setDefaultImg(spuImg) {
      this.spuImageList.forEach(item => (item.isDefault = "0"));
      spuImg.isDefault = "1";
      // 保存默认图片地址
      this.skuInfo.skuDefaultImg = spuImg.imgUrl;
    },

    //table列表选中发生改变的监听回调
    handleSelectionChange(value) {
      this.selectedSpuImageList = value;
    },

    //初始化加载数据
    initLoadAddData(spu) {
      this.spu = spu;
      // 将spu中的信息数据保存到skuInfo中
      this.skuInfo.category3Id = spu.category3Id;
      this.skuInfo.spuId = spu.id;
      this.skuInfo.tmId = spu.tmId;
      this.getDate();
    },

    //请求获取所有需要显示的数据
    /*
    根据3个级别分类ID获取所有的平台属性列表: attr.getList
    根据spu的ID获取SPU图片列表: sku.getSpuImageList
    根据SPU的ID获取SPU销售属性列表: sku.getSpuSaleAttrList
    */
    async getDate() {
      const { category1Id, category2Id, category3Id, id } = this.spu;
      const promise1 = this.$API.attr.getList(
        category1Id,
        category2Id,
        category3Id
      );
      const promise2 = this.$API.sku.getSpuImageList(id);
      const promise3 = this.$API.sku.getSpuSaleAttrList(id);
      const results = await Promise.all([promise1, promise2, promise3]);

      this.attrList = results[0].data;

      // 给得到的图片列表中的图片对象都添加一个isDefault属性 ===> 后面更新默认图片方便
      const spuImageList = results[1].data.map(item => ({
        ...item,
        isDefault: "0"
      }));
      this.spuImageList = spuImageList;
      this.spuSaleAttrList = results[2].data;
    },

    back() {
      // 分发自定义事件, 让修改页面关闭
      this.$emit("update:visible", false);
      // 重置数据
      this.resetData();
    },

    resetData() {
      this.skuInfo = {
        category3Id: null,
        spuId: null,
        tmId: null,
        skuName: null,
        skuDesc: "",
        price: null,
        weight: null,
        skuDefaultImg: "",
        skuAttrValueList: [],
        skuSaleAttrValueList: [],
        skuImageList: []
      };
      this.spu = {};
      this.attrList = [];
      this.spuSaleAttrList = [];
      this.spuImageList = [];
      this.selectedSpuImageList = [];
    }
  }
};
</script>

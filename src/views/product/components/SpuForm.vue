<template>
  <el-card>
    <el-form
      :label-position="labelPosition"
      label-width="80px"
      v-show="visible"
    >
      <el-form-item label="SPU名称">
        <el-input v-model="spuInfo.spuName"></el-input>
      </el-form-item>
      <el-form-item label="品牌">
        <el-select v-model="spuInfo.tmId">
          <el-option
            :label="tm.tmName"
            :value="tm.id"
            v-for="tm in trademarkList"
            :key="tm.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="SPU描述">
        <el-input
          type="textarea"
          rows="4"
          v-model="spuInfo.description"
        ></el-input>
      </el-form-item>

      <el-form-item label="SPU图片">
        <el-upload
          action="/dev-api/admin/product/fileUpload"
          list-type="picture-card"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove"
          :on-success="handleUpSuccess"
          :file-list="spuImageList"
        >
          <i class="el-icon-plus"></i>
        </el-upload>
        <el-dialog :visible.sync="dialogVisible">
          <img width="100%" :src="dialogImageUrl" alt="" />
        </el-dialog>
      </el-form-item>

      <el-form-item label="销售属性">
        <el-select
          v-model="attrIdAttrName"
          :placeholder="
            UnsaleAttrList.length > 0
              ? `还有${UnsaleAttrList.length}个属性可选`
              : '没有啦！'
          "
        >
          <el-option
            :label="attr.name"
            :value="attr.id + ':' + attr.name"
            v-for="attr in UnsaleAttrList"
            :key="attr.id"
          ></el-option>
        </el-select>
        <el-button
          type="primary"
          icon="el-icon-plus"
          @click="addSaleAttr"
          :disabled="!attrIdAttrName"
          >添加销售属性</el-button
        >

        <el-table border style="margin:20px 0" :data="spuInfo.spuSaleAttrList">
          <el-table-column label="序号" type="index" width="80" align="center">
          </el-table-column>
          <el-table-column label="属性名" prop="saleAttrName">
          </el-table-column>

          <el-table-column label="属性值名称">
            <template slot-scope="{ row, $index }">
              <el-tag
                :key="value.id"
                v-for="(value, index) in row.spuSaleAttrValueList"
                closable
                :disable-transitions="false"
                @close="handleClose(row, index)"
              >
                {{ value.saleAttrValueName }}
              </el-tag>
              <el-input
                class="input-new-tag"
                v-if="row.isInput"
                v-model="row.saleAttrValueName"
                ref="saveTagInput"
                size="small"
                @keyup.enter.native="handleInputConfirm(row)"
                @blur="handleInputConfirm(row)"
              >
              </el-input>
              <el-button
                v-else
                class="button-new-tag"
                size="small"
                @click="showInput(row)"
                >+ 添加</el-button
              >
            </template>
          </el-table-column>

          <el-table-column label="操作">
            <template slot-scope="{ row, $index }">
              <el-popconfirm
                title="确定要删除吗？"
                @onConfirm="spuInfo.spuSaleAttrList.splice($index, 1)"
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

        <el-button type="primary" @click="save">保存</el-button>
        <el-button @click="back">返回</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script>
export default {
  name: "SpuForm",

  props: {
    visible: Boolean
  },

  data() {
    return {
      labelPosition: "right", //表单文字右对齐
      dialogImageUrl: "", //上传照片大图显示地址
      dialogVisible: false,

      spuId: "",
      //spu详情
      spuInfo: {
        spuName: "", //spu名字
        description: "", //spu描述
        tmId: null, //品牌id
        spuSaleAttrList: [], //spu销售属性列表
        spuImageList: [] //spu图片列表
      },

      spuImageList: [], //spu图片列表
      saleAttrList: [], //销售属性列表
      trademarkList: [], //所有品牌列表
      attrIdAttrName: "" //收集销售属性id:name
    };
  },

  computed: {
    UnsaleAttrList() {
      return this.saleAttrList.filter(attr =>
        this.spuInfo.spuSaleAttrList.every(
          item => item.saleAttrName !== attr.name
        )
      );
    }
  },

  methods: {
    //整理数据保存并请求
    async save() {
      const { spuInfo, spuImageList } = this;
      //整理1：销售属性列表
      /*
        1. 删除不必要的参数数据: 数组元素对象(属性对象)很可能有2个不必要的数据
        2. 过滤掉没有一个属性值对象的属性
      */
      spuInfo.spuSaleAttrList = spuInfo.spuSaleAttrList.filter(item => {
        delete item.isInput;
        delete item.attrIdAttrName;
        return item.spuSaleAttrValueList.length > 0;
      });

      //整理2：整理图片数据
      /*
      整理前:
        {
          id:1553
          imgName:"2fc5f623d055f89c.jpg"
          imgUrl:"http://182.92.128.115:8080/xxx.jpg"
          name:"2fc5f623d055f89c.jpg"
          url:"http://182.92.128.115:8080/xxx.jpg"
        }

        {
          name: 'fa6e854a56ff9b46.png',
          url: 'blob:http://localhost:9529/0b11fe66-1f6a-432d-b327-e48745825a8c',
          response: {
            data: 'http://182.92.128.115:8080/xxx.png'
          }
        }

      整理后的样子：
        {
          "imgName": "rBHu8l6UcKyAfzDsAAAPN5YrVxw870.jpg",
          "imgUrl": "http://47.93.148.192:8080/xxx.jpg"
        }
      */

      spuInfo.spuImageList = spuImageList.map(item => ({
        imgName: item.name,
        imgUrl: item.response ? item.response.data : item.url
      }));

      const result = await this.$API.spu.addUpdate(spuInfo);
      if (result.code === 200) {
        this.$message.success("保存成功");
        this.resetData();
        this.$emit("update:visible", false);
        this.$emit("saveEnd");
      } else {
        this.$message.error("保存失败");
      }
    },

    //添加销售属性
    addSaleAttr() {
      const [baseSaleAttrId, saleAttrName] = this.attrIdAttrName.split(":");
      this.spuInfo.spuSaleAttrList.push({
        baseSaleAttrId,
        saleAttrName,
        spuSaleAttrValueList: []
      });
      this.attrIdAttrName = "";
    },

    // 点击确认或enter
    handleInputConfirm(value) {
      const { saleAttrValueName, baseSaleAttrId } = value;
      //限制1：输入为空不添加
      if (!saleAttrValueName) {
        value.isInput = false;
        return;
      }
      // 限制2: 输入的属性值名称不能与已有重复
      const isRepeat = value.spuSaleAttrValueList.some(
        item => item.saleAttrValueName === saleAttrValueName
      );
      if (isRepeat) {
        this.$message.warning("属性名已存在");
        value.saleAttrValueName = "";
        return;
      }

      value.spuSaleAttrValueList.push({
        saleAttrValueName,
        baseSaleAttrId
      });

      //查看模式
      value.isInput = false;
      value.saleAttrValueName = "";
    },

    //显示输入框
    showInput(value) {
      if (value.hasOwnProperty("isInput")) {
        value.isInput = true;
      } else {
        this.$set(value, "isInput", true);
      }
      this.$nextTick(() => {
        this.$refs.saveTagInput.focus();
      });
    },

    //删除属性值
    handleClose(value, index) {
      value.spuSaleAttrValueList.splice(index, 1);
    },

    //图片上传后的回调
    handleUpSuccess(response, file, fileList) {
      this.spuImageList = fileList;
    },

    //图片删除后回调
    handleRemove(file, fileList) {
      this.spuImageList = fileList;
    },
    //显示大图回调
    handlePictureCardPreview(file) {
      this.dialogImageUrl = file.url;
      this.dialogVisible = true;
    },

    //修改界面初始数据获取
    initLoadUpdateData(id) {
      this.spuId = id;
      this.getSpuInfo();
      this.getSpuImageList();
      this.getTrademarkList();
      this.getSaleList();
    },

    //添加界面初始数据获取
    initLoadAddData(category3Id) {
      this.spuInfo.category3Id = category3Id;
      this.getTrademarkList();
      this.getSaleList();
    },

    //获取指定id的SPU信息
    async getSpuInfo() {
      const result = await this.$API.spu.get(this.spuId);
      if (result.code === 200) {
        this.spuInfo = result.data;
      }
    },

    //获取指定SPU的id对应的图片列表
    async getSpuImageList() {
      const result = await this.$API.sku.getSpuImageList(this.spuId);
      if (result.code === 200) {
        const spuImageList = result.data;
        //整理显示图片需要的数据
        spuImageList.forEach(item => {
          item.name = item.imgName;
          item.url = item.imgUrl;
        });

        this.spuImageList = spuImageList;
      }
    },

    //获取所有品牌的列表
    async getTrademarkList() {
      const result = await this.$API.trademark.getList();
      if (result.code === 200) {
        this.trademarkList = result.data;
      }
    },

    //获取所有销售属性列表
    async getSaleList() {
      const result = await this.$API.spu.getSaleList();
      if (result.code === 200) {
        this.saleAttrList = result.data;
      }
    },

    //点击返回
    back() {
      this.resetData();
      this.$emit("update:visible", false);
      this.$emit("cancel");
    },

    //重置数据
    resetData() {
      this.spuId = "";
      this.spuInfo = {
        category3Id: "",
        spuName: "", //spu名字
        description: "", //spu描述
        tmId: null, //品牌id
        spuSaleAttrList: [], //spu销售属性列表
        spuImageList: [] //spu图片列表
      };

      this.spuImageList = []; //spu图片列表
      this.saleAttrList = []; //销售属性列表
      this.trademarkList = []; //所有品牌列表
      this.sattrIdAttrName = ""; //收集销售属性id:name
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

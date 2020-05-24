<template>
  <el-form :label-position="labelPosition" label-width="80px" v-show="visible">
    <el-form-item label="SPU 名称">
      <span>atguigu</span>
    </el-form-item>

    <el-form-item label="SPU 名称">
      <el-input placeholder="SKU 名称"></el-input>
    </el-form-item>
    <el-form-item label="价格">
      <el-input placeholder="SKU 价格"></el-input>
    </el-form-item>
    <el-form-item label="重量(千克)">
      <el-input placeholder="SKU 重量"></el-input>
    </el-form-item>
    <el-form-item label="规格描述">
      <el-input type="textarea" placeholder="SKU 规格描述" rows="4"></el-input>
    </el-form-item>

    <el-form-item label="平台属性">
      <el-form inline label-width="80px">
        <el-form-item style="margin: 5px" label="平台属性">
          <el-select placeholder="活动区域" value="">
            <el-option label="区域一" value="shanghai"></el-option>
            <el-option label="区域二" value="beijing"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="margin: 5px" label="平台属性">
          <el-select placeholder="活动区域" value="">
            <el-option label="区域一" value="shanghai"></el-option>
            <el-option label="区域二" value="beijing"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="margin: 5px" label="平台属性">
          <el-select placeholder="活动区域" value="">
            <el-option label="区域一" value="shanghai"></el-option>
            <el-option label="区域二" value="beijing"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </el-form-item>

    <el-form-item label="销售属性">
      <el-form inline label-width="80px">
        <el-form-item style="margin: 5px" label="平台属性">
          <el-select placeholder="活动区域" value="">
            <el-option label="区域一" value="shanghai"></el-option>
            <el-option label="区域二" value="beijing"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="margin: 5px" label="平台属性">
          <el-select placeholder="活动区域" value="">
            <el-option label="区域一" value="shanghai"></el-option>
            <el-option label="区域二" value="beijing"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item style="margin: 5px" label="平台属性">
          <el-select placeholder="活动区域" value="">
            <el-option label="区域一" value="shanghai"></el-option>
            <el-option label="区域二" value="beijing"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </el-form-item>

    <el-form-item label="图片列表">
      <el-table ref="multipleTable" border>
        <el-table-column type="selection" width="55"> </el-table-column>
        <el-table-column label="图片"> </el-table-column>
        <el-table-column label="名称"> </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="{ row }">
            <el-button type="primary">设为默认</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-form-item>

    <el-form-item>
      <template slot-scope="{ row }">
        <el-button type="primary">保存</el-button>
        <el-button @click="back">返回</el-button>
      </template>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  name: "SkuForm",
  props: {
    visible: Boolean
  },

  data() {
    return {
      labelPosition: "right"
    };
  },

  methods: {
    back() {
      // 分发自定义事件, 让修改页面关闭
      this.$emit("update:visible", false);
    }
  }
};
</script>

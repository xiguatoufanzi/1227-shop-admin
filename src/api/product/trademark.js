import request from "@/utils/request";
const API_NAME = "/admin/product/baseTrademark";

export default {
  //根据id获取对应的品牌
  getById(id) {
    return request(`${API_NAME}/get/${id}`);
  },

  //获取所有品牌的列表
  getList(page, limit) {
    if (page && limit) {
      return request(`/admin/product/baseTrademark/${page}/${limit}`);
    } else {
      return request(`${API_NAME}/getTrademarkList`);
    }
  },

  //根据id删除对应的品牌
  remove(id) {
    return request.delete(`${API_NAME}/remove/${id}`);
  },

  //添加一个新的品牌
  add(trademark) {
    return request.post(`${API_NAME}/save`, trademark);
  },

  //更新品牌
  update(trademark) {
    return request.put(`${API_NAME}/update`, trademark);
  }

  //获取品牌分页列表
  /* getPageList(page, limit){
    return request(`/admin/product/baseTrademark/${page}/${limit}`)
  } */
};

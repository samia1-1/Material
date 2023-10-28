const news = {
  state: {
    newSRC:''
  },

  mutations: {
    SET_NEWSRC: (state, newSRC) => {
      state.newSRC = newSRC
    },
  },

  actions: {
    //修改newSRC
    setNewSRC({ commit },newValue){
      commit('SET_NEWSRC',newValue)
    }
  }
}

export default news

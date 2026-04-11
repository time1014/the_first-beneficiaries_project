import { defineStore } from 'pinia'

export const useBeneStore = defineStore('bene', {
  state: () => ({
    beneficiaries_no: 0,
    manager_no: 0,
    subManager_no : 0,
    beneficiaries_name : null,
    survey_no: 0,
    refreshCounsel: false,
    selectedCounsel: null,
    isEditMode: false
  }),
  actions: {
    async fetchUsers(user_no) {
      try {
        const resp = await fetch(`/api/beneficiaries/${user_no}`)
        const data = await resp.json()
        this.beneficiaries_no = data[0].beneficiaries_no;
        this.beneficiaries_name = data[0].beneficiaries_name;
        this.manager_no = data[0].manager_no;
        this.subManager_no=  data[0].sub_manager_no;
        this.survey_no = data[0].survey_no;
      } catch (err) {
        console.log(err)
      }
    }
  }
})
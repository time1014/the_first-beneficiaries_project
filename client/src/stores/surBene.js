import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useBeneStore = defineStore('bene', () => {
  const beneficiaries_no = ref(0)
  const manager_no = ref(0)
  const subManager_no = ref(0)
  const beneficiaries_name = ref(null)
  const survey_no = ref(0)

  const refreshCounsel = ref(false)
  const selectedCounsel = ref(null)
  const isEditMode = ref(false)

  async function fetchUsers(user_no) {
    try {
      const resp = await fetch(`/api/beneficiaries/${user_no}`)
      const data = await resp.json()

      beneficiaries_no.value = data[0].beneficiaries_no
      beneficiaries_name.value = data[0].beneficiaries_name
      manager_no.value = data[0].manager_no
      subManager_no.value = data[0].sub_manager_no
      survey_no.value = data[0].survey_no
    } catch (err) {
      console.log(err)
    }
  }

  return {
    beneficiaries_no,
    manager_no,
    subManager_no,
    beneficiaries_name,
    survey_no,
    refreshCounsel,
    selectedCounsel,
    isEditMode,
    fetchUsers
  }
})

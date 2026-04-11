import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
    const user_no = ref(null)
    const role = ref('')
    const user_id = ref('')
    const user_name = ref('')
    const approval = ref(0)
    const institution = ref(0)

    function setUser(user) {
        user_no.value = user.user_no
        role.value = user.role
        user_id.value = user.user_id
        user_name.value = user.user_name
        approval.value = user.approval
        institution.value = user.institution_no
    }

    function updateUser(data) {
        user_name.value = data.user_name
        role.value = data.role
    }

    function logout() {
        user_no.value = null
        role.value = ''
        user_id.value = ''
        user_name.value = ''
        approval.value = 0
        institution.value = 0
    }

    return {
        user_no,
        role,
        user_id,
        user_name,
        approval,
        institution,
        setUser,
        updateUser,
        logout
    }
})

import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
    state: () => ({
        user_no: null,
        role: '',
        user_id: '',
        user_name: '',
        approval: 0,
        institution: 0
    }),
    actions: {
        setUser(user) {
            this.user_no = user.user_no;
            this.role = user.role;
            this.user_id = user.user_id;
            this.user_name = user.user_name;
            this.approval = user.approval;
            this.institution = user.institution_no;

            localStorage.setItem('user', JSON.stringify(user));
        },

        // 사용자 이름/권한 등 일부 정보만 갱신할 때 사용
        updateUser(data) {
            this.user_name = data.user_name;
            this.role = data.role;

            // localStorage도 같이 갱신해야 새로고침/재접속 시 반영됨
            const savedUser = JSON.parse(localStorage.getItem('user')) || {};
            savedUser.user_name = data.user_name;
            savedUser.role = data.role;

            localStorage.setItem('user', JSON.stringify(savedUser));
        },

        loadUser() {
            const data = localStorage.getItem('user');
            if (data) {
                const user = JSON.parse(data);
                this.setUser(user);
            }
        },
        logout() {
            this.$reset();
            localStorage.removeItem('user');
        }
    }
});

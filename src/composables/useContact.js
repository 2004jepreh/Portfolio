import { ref } from 'vue'

// Status popup Contact, dipakai bersama oleh menu (SideNav) dan popup (ContactModal).
export const contactOpen = ref(false)

export const openContact = () => {
  contactOpen.value = true
}

export const closeContact = () => {
  contactOpen.value = false
}
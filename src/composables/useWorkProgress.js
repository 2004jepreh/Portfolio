import { ref } from 'vue'

// Posisi scroll halaman Work yang dibagikan ke komponen lain (misalnya logo di header).
// Nilainya terus bertambah/berkurang mengikuti scroll, dan berhenti di bilangan bulat.
export const workProgress = ref(0)

// Putaran tambahan logo dari scroll di halaman project (juga berhenti di bilangan bulat).
export const logoOffset = ref(0)
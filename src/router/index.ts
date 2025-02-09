import { createRouter, createWebHistory } from "vue-router";
import SnakeGame from "@/components/SnakeGame.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: SnakeGame,
    },
  ],
});

export default router;

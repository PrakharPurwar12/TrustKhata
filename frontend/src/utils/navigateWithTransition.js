export const navigateWithTransition = (navigate, to) => {
  if (document.startViewTransition) {
    document.startViewTransition(() => navigate(to));
    return;
  }

  navigate(to);
};


export const formatNumberWithCommas = (num: string): string => {
  return num.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}


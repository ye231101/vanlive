export interface InventoryUnit {
  id: string;
  idNoPrefix: string;
  orderCol: number;
  title: string;
  location: string;
  stockNumber: string;
  imageCloudinaryIds?: string[];
  images?: string[];
  thumbnails?: string[];
  defaultImageUrl?: string;
  customTags: string[];
  favorites?: number;
  slideOutsCount: number;
  wI_Body: string;
  wI_DaysInStock: number;
  wI_Engine: string;
  wI_Fuel: string;
  wI_InventoryType: string;
  wI_Make: string;
  wI_Model: string;
  wI_Length: number;
  wI_ListPrice: number;
  wI_MapPrice: number;
  wI_Mileage: number;
  wI_SlideOuts: string;
  wI_SalePrice?: number | null;
  websitePrice?: number | null;
  priceFlag?: string | null;
  rebate?: {
    amount: number;
    enddate: number;
    timezone: string;
    type: string;
  };
  inFlashSale?: boolean;
  isSpecialOffer?: boolean;
  isTooLowToShow: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VideoUnit {
  id: string;
  username: string;
  url: string;
  thumbnail: string;
  title: string;
  description: string;
  tags: string[];
  views: number;
  likes: number;
  comments: number;
  bookmarks: number;
  createdAt: string;
  updatedAt: string;
}

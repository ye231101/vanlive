import { locationLabelFromValue, labelFromValue } from '@/lib/utils';
import type { InventoryUnit } from '@/types';

export interface InventoryItem {
  id: string;
  id_no_prefix: string;
  order_col: number;
  title: string;
  location: string;
  stock_number: string;
  image_cloudinary_ids?: string[] | null;
  images?: string[] | null;
  thumbnails?: string[] | null;
  default_image_url?: string | null;
  custom_tags?: string[] | null;
  favorites?: number | null;
  slide_outs_count: number;
  wi_body: string;
  wi_days_in_stock: number;
  wi_engine?: string | null;
  wi_fuel: string;
  wi_inventory_type: string;
  wi_make: string;
  wi_model: string;
  wi_length: number;
  wi_list_price: number;
  wi_map_price: number;
  wi_mileage: number;
  wi_slide_outs: string;
  wi_sale_price?: number | null;
  website_price?: number | null;
  price_flag?: string | null;
  rebate_amount?: number | null;
  rebate_enddate?: number | null;
  rebate_timezone?: string | null;
  rebate_type?: string | null;
  in_flash_sale?: boolean;
  is_special_offer?: boolean;
  is_too_low_to_show: boolean;
  created_at: string;
  updated_at: string;
}

export interface InventoryPagination {
  currentPage: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface InventoryListResponse {
  code: number;
  message: string;
  data: {
    inventories: InventoryItem[];
    pagination: InventoryPagination;
  };
}

export interface InventoryResponse {
  code: number;
  message: string;
  data: {
    inventory: InventoryItem;
  };
}

export function mapInventoryItem(r: InventoryItem): InventoryUnit {
  const amount = r.rebate_amount;
  const rebate =
    typeof amount === 'number' && amount > 0
      ? {
          amount,
          enddate: r.rebate_enddate ?? 0,
          timezone: r.rebate_timezone ?? '',
          type: r.rebate_type ?? '',
        }
      : undefined;

  return {
    id: r.id,
    idNoPrefix: r.id_no_prefix,
    orderCol: r.order_col,
    title: r.title,
    location: locationLabelFromValue(r.location),
    stockNumber: r.stock_number,
    imageCloudinaryIds: r.image_cloudinary_ids ?? undefined,
    images: r.images ?? undefined,
    thumbnails: r.thumbnails ?? undefined,
    defaultImageUrl: r.default_image_url ?? undefined,
    customTags: r.custom_tags ?? [],
    favorites: r.favorites ?? undefined,
    slideOutsCount: r.slide_outs_count,
    wI_Body: labelFromValue(r.wi_body),
    wI_DaysInStock: r.wi_days_in_stock,
    wI_Engine: r.wi_engine ?? '',
    wI_Fuel: labelFromValue(r.wi_fuel),
    wI_InventoryType: labelFromValue(r.wi_inventory_type),
    wI_Make: labelFromValue(r.wi_make),
    wI_Model: labelFromValue(r.wi_model),
    wI_Length: r.wi_length,
    wI_ListPrice: r.wi_list_price,
    wI_MapPrice: r.wi_map_price,
    wI_Mileage: r.wi_mileage,
    wI_SlideOuts: r.wi_slide_outs,
    wI_SalePrice: r.wi_sale_price,
    websitePrice: r.website_price,
    priceFlag: r.price_flag,
    rebate,
    inFlashSale: r.in_flash_sale,
    isSpecialOffer: r.is_special_offer,
    isTooLowToShow: r.is_too_low_to_show,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

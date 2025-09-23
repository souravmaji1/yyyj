import { combineReducers } from "@reduxjs/toolkit";
import productReducer from "./slices/productSlice";
import catalogReducer from "./slices/catalog.Slice";
import tagReducer from "./slices/tag.Slice";
import productFilterReducer from "./slices/productFilter.slice";
import cartReducer from "./slices/cartSlice";
import kioskCartReducer from "./slices/kioskCartSlice";
import userReducer from "./slices/userSlice";
import paymentReducer from "./slices/paymentSlice";
import couponReducer from "./slices/couponSlice";
import productPaymentReducer from "./slices/productPaymentSlice";
import orderReducer from "./slices/orderSlice";
import nftReducer from "./slices/nftSlice";
import kycReducer from "./slices/kycSlice";
import  nftbyIdReducer  from "./slices/transferSlice";
import adminSettingReducer from "./slices/adminSettingSlice";
import reviewReducer from './slices/reviewSlice';
import notificationReducer from './slices/notificationSlice';
import CategoriesReducer from './slices/marketCategoriesSlice';
import seriesReducer from './slices/marketSeriesSlice';
import qrModalReducer from './slices/qrModalSlice';
import machineReducer from './slices/machineSlice';
import phoneVerificationReducer from './slices/phoneVerificationSlice';
import adManagementReducer from './slices/adManagementSlice';
import aiStudioReducer from './slices/aiStudioSlice';
import gameReducer from './slices/gameSlice';
import videoRewardsReducer from './slices/videoRewardsSlice';
import assistantReducer from './slices/assistantSlice';
import tryonReducer from './slices/tryonSlice';
import tryonHistoryReducer from './slices/tryonHistorySlice';

const rootReducer = combineReducers({
  product: productReducer,
  catalog: catalogReducer,
  tags: tagReducer,
  productFilter: productFilterReducer,
  cart: cartReducer,
  kioskCart: kioskCartReducer,
  user: userReducer,
  payment: paymentReducer,
  coupon: couponReducer,
  productPayment: productPaymentReducer,
  order: orderReducer,
  allNft: nftReducer,
  kyc: kycReducer,
  transfer:nftbyIdReducer,
  adminSettings: adminSettingReducer,
  reviews: reviewReducer,
  notifications: notificationReducer,
  categories:CategoriesReducer,
  series:seriesReducer,
  qrModal: qrModalReducer,
  machine: machineReducer,
  phoneVerification: phoneVerificationReducer,
  adManagement: adManagementReducer,
  aiStudio: aiStudioReducer,
  games: gameReducer,
  videoRewards: videoRewardsReducer,
  assistant: assistantReducer,
  tryon: tryonReducer,
  tryonHistory: tryonHistoryReducer,
});

export default rootReducer;

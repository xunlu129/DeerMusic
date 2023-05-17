import { request } from "@/network/request";

// 二维码登录流程：生成key => 根据key生成二维码 => 轮询获取二维码接口状态
// 二维码生成key
export function getQrCodeKey(query) {
    return request('/login/qr/key', query);
}

// 生成二维码
export function getQrCode(query) {
    return request('/login/qr/create', query);
}

// 获取二维码状态
export function checkQrCode(query) {
    return request('/login/qr/check', query);
}

// 获取账号信息
export function getAccountInfo() {
    return request('/user/account');
}
package com.parking.service;

import com.parking.dto.request.LoginRequest;
import com.parking.dto.request.RegisterRequest;
import com.parking.dto.response.LoginResponse;

public interface AuthService {
    
    LoginResponse login(LoginRequest request);
    
    String register(RegisterRequest request);
}

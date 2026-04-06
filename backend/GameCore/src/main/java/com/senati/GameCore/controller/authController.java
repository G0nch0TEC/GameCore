package com.senati.GameCore.controller;

import com.senati.GameCore.dto.LoginRequest;
import com.senati.GameCore.dto.RegisterRequest;
import com.senati.GameCore.dto.authResponse;
import com.senati.GameCore.service.authService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class authController {

    private authService authService;

    public authController(authService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<authResponse> register(@RequestBody RegisterRequest registerRequest){
        return ResponseEntity.ok(authService.register(registerRequest));
    }

    @PostMapping("/login")
    public ResponseEntity<authResponse> login(@RequestBody LoginRequest loginRequest){
        return ResponseEntity.ok(authService.login(loginRequest));
    }
}

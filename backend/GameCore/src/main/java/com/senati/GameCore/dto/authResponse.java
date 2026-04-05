package com.senati.GameCore.dto;

public class authResponse {
    private String token;

    public authResponse() {}

    public authResponse(String token) {
        this.token = token;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
}

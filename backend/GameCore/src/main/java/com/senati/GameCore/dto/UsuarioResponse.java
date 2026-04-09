package com.senati.GameCore.dto;

import com.senati.GameCore.model.Usuario;
import java.time.LocalDateTime;

public class UsuarioResponse {

    private Integer idUsuario;
    private String nombre;
    private String correo;
    private Usuario.Rol rol;
    private LocalDateTime fechaRegistro;

    public UsuarioResponse(Usuario usuario) {
        this.idUsuario = usuario.getIdUsuario();
        this.nombre = usuario.getNombre();
        this.correo = usuario.getCorreo();
        this.rol = usuario.getRol();
        this.fechaRegistro = usuario.getFechaRegistro();
    }

    public Integer getIdUsuario() { return idUsuario; }
    public String getNombre() { return nombre; }
    public String getCorreo() { return correo; }
    public Usuario.Rol getRol() { return rol; }
    public LocalDateTime getFechaRegistro() { return fechaRegistro; }
}
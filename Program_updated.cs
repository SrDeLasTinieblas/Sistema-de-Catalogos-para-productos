using Biblioteca.Infrastructure.Persistence;
using Biblioteca.Infrastructure.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Obtener la cadena de conexión desde appsettings.json
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Controladores
builder.Services.AddControllers();

// ============================================
// CONFIGURAR LÍMITES PARA MANEJAR BASE64
// ============================================

// 1. Aumentar el límite de tamaño del cuerpo de la solicitud
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 104857600; // 100 MB
    options.ValueLengthLimit = 104857600; // 100 MB
    options.MultipartHeadersLengthLimit = 16384; // 16 KB
});

// 2. Configurar Kestrel para aceptar solicitudes más grandes
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.Limits.MaxRequestBodySize = 104857600; // 100 MB
    serverOptions.Limits.MaxRequestLineSize = 16384; // 16 KB (para query strings largas)
    serverOptions.Limits.MaxRequestHeadersTotalSize = 32768; // 32 KB
});

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Sistema de Gestion de Catalogos", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = @"JWT Authorization header using the Bearer scheme.
                        Enter 'Bearer' [space] and then your token in the text input below.
                        Example: 'Bearer 12345abcdef'",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement()
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                },
                Scheme = "oauth2",
                Name = "Bearer",
                In = ParameterLocation.Header,
            },
            new List<string>()
        }
    });
});

// Base de Datos
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Autenticación con JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireSuperAdminRole", policy =>
        policy.RequireRole("SuperAdmin", "Administrador"));

    options.AddPolicy("RequirePropietarioRole", policy => policy.RequireRole("Propietario"));
    options.AddPolicy("RequireVisitanteRole", policy => policy.RequireRole("Visitante"));
});

// ============================================
// CONFIGURAR CORS CON MÁS OPCIONES
// ============================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigins", policy =>
    {
        policy.WithOrigins("https://a159fc4c62b4.ngrok-free.app", "http://localhost:3000", "http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .WithExposedHeaders("x-auth-token")
              .SetPreflightMaxAge(TimeSpan.FromMinutes(10)); // Cache preflight por 10 minutos
    });
});

builder.Services.AddHttpContextAccessor();

// Servicios Personalizados (inyección de dependencias)
builder.Services.AddHttpClient();

builder.Services.AddScoped<GeneralServices>();
builder.Services.AddScoped<UsuarioServices>();
builder.Services.AddScoped<JWTServices>();
builder.Services.AddScoped<EmailServices>();
builder.Services.AddScoped<MercadoPagoServices>();

var app = builder.Build();

// Configuración de Swagger (para desarrollo, staging y producción)
if (app.Environment.IsDevelopment() || app.Environment.IsStaging() || app.Environment.IsProduction())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Sistema de Gestion de catalogos API v1");
        c.RoutePrefix = string.Empty;
    });
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// IMPORTANTE: CORS debe ir ANTES de Authentication y Authorization
app.UseCors("AllowSpecificOrigins");

// Middleware de Autenticación y Autorización
app.UseAuthentication();
app.UseAuthorization();

// Mapeo de controladores
app.MapControllers();

// Ejecución de la Aplicación
app.Run();

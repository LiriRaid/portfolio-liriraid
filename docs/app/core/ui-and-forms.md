# UI y formularios

Documentación de `src/app/core/forms/`.

## Archivos clave

| Archivo | Descripción |
|---------|-------------|
| `control-value-accessor.provider.ts` | Helper que genera el provider `NG_VALUE_ACCESSOR` para componentes de formulario |

## ¿Para qué sirve?

`ControlValueAccessor` es la interfaz que Angular requiere para integrar un componente personalizado con `ReactiveFormsModule` o `FormsModule` (formularios con `formControl`, `ngModel`, etc.).

Implementar `NG_VALUE_ACCESSOR` manualmente en cada componente de formulario es verboso. Este helper lo encapsula:

```typescript
// En lugar de repetir esto en cada componente:
providers: [
  {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MyInputComponent),
    multi: true,
  }
]

// Se usa el helper:
providers: [provideControlValueAccessor(MyInputComponent)]
```

## Relación

- `shared/components/portfolio-input/` usa este provider para integrarse con `ReactiveFormsModule`.
- `features/portfolio/sections/contact/contact.ts` usa `portfolio-input` en un `FormGroup` reactivo.

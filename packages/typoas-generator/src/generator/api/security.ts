import { Context } from '../../context';
import { ReferenceObject, SecuritySchemeObject } from 'openapi3-ts';
import {
  factory,
  FunctionDeclaration,
  SyntaxKind,
  TypeAliasDeclaration,
} from 'typescript';
import { createRuntimeRefType, ExportedRef } from '../utils/ref';
import {
  createConfigTypeFromSecurityScheme,
  createRuntimeSecurityClass,
} from '../components/security-scheme';
import { hasUnsupportedIdentifierChar } from '../utils/operation-name';

export const AUTH_TYPE_NAME = 'AuthMethods';

export function createAuthMethodsType(
  securitySchemes: Record<string, SecuritySchemeObject | ReferenceObject>,
  ctx: Context,
): TypeAliasDeclaration {
  return factory.createTypeAliasDeclaration(
    [factory.createModifier(SyntaxKind.ExportKeyword)],
    AUTH_TYPE_NAME,
    undefined,
    factory.createTypeLiteralNode(
      Object.entries(securitySchemes).map(([name, sec]) =>
        factory.createPropertySignature(
          undefined,
          hasUnsupportedIdentifierChar(name)
            ? factory.createStringLiteral(name, true)
            : factory.createIdentifier(name),
          factory.createToken(SyntaxKind.QuestionToken),
          createConfigTypeFromSecurityScheme(sec, ctx),
        ),
      ),
    ),
  );
}

export function createConfigureAuthFunction(
  securitySchemes: Record<string, SecuritySchemeObject | ReferenceObject>,
  ctx: Context,
): FunctionDeclaration {
  return factory.createFunctionDeclaration(
    [factory.createModifier(SyntaxKind.ExportKeyword)],
    undefined,
    'configureAuth',
    undefined,
    [
      factory.createParameterDeclaration(
        undefined,
        undefined,
        factory.createIdentifier('params'),
        factory.createToken(SyntaxKind.QuestionToken),
        factory.createIndexedAccessTypeNode(
          createRuntimeRefType(ExportedRef.CreateContextParams, [
            factory.createTypeReferenceNode(
              factory.createIdentifier(AUTH_TYPE_NAME),
            ),
          ]),
          factory.createLiteralTypeNode(
            factory.createStringLiteral('authProviders'),
          ),
        ),
      ),
    ],
    factory.createTypeReferenceNode(AUTH_TYPE_NAME),
    factory.createBlock(
      [
        factory.createReturnStatement(
          factory.createObjectLiteralExpression(
            Object.entries(securitySchemes).map(([name, sec]) =>
              factory.createPropertyAssignment(
                hasUnsupportedIdentifierChar(name)
                  ? factory.createStringLiteral(name, true)
                  : factory.createIdentifier(name),
                factory.createLogicalAnd(
                  hasUnsupportedIdentifierChar(name)
                    ? factory.createElementAccessChain(
                        factory.createIdentifier('params'),
                        factory.createToken(SyntaxKind.QuestionDotToken),
                        factory.createStringLiteral('jwt'),
                      )
                    : factory.createPropertyAccessChain(
                        factory.createIdentifier('params'),
                        factory.createToken(SyntaxKind.QuestionDotToken),
                        factory.createIdentifier(name),
                      ),
                  createRuntimeSecurityClass(
                    sec,
                    hasUnsupportedIdentifierChar(name)
                      ? factory.createElementAccessExpression(
                          factory.createIdentifier('params'),
                          factory.createStringLiteral(name),
                        )
                      : factory.createPropertyAccessExpression(
                          factory.createIdentifier('params'),
                          factory.createIdentifier(name),
                        ),
                    ctx,
                  ),
                ),
              ),
            ),
          ),
        ),
      ],
      true,
    ),
  );
}

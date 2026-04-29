import { describe, it, expect } from 'vitest'
import { slugify } from '../slugify'

describe('slugify', () => {
  it('should convert text to lowercase', () => {
    expect(slugify('HELLO')).toBe('hello')
    expect(slugify('HeLLo WoRLD')).toBe('hello-world')
  })

  it('should trim whitespace from beginning and end', () => {
    expect(slugify('  hello  ')).toBe('hello')
    expect(slugify('\nhello\n')).toBe('hello')
  })

  it('should remove special characters', () => {
    expect(slugify('hello@world!')).toBe('helloworld')
    expect(slugify('test#123')).toBe('test123')
    expect(slugify('foo.bar')).toBe('foobar')
  })

  it('should replace spaces with hyphens', () => {
    expect(slugify('hello world')).toBe('hello-world')
    expect(slugify('foo bar baz')).toBe('foo-bar-baz')
  })

  it('should handle multiple consecutive hyphens', () => {
    expect(slugify('hello  world')).toBe('hello-world')
    expect(slugify('foo---bar')).toBe('foo-bar')
  })

  it('should handle mixed input with special characters, spaces, and uppercase', () => {
    expect(slugify('Hello, World!')).toBe('hello-world')
    // Note: underscore is removed since it's not in the allowed character set
    expect(slugify('My Test_String @2024')).toBe('my-teststring-2024')
  })

  it('should handle empty string', () => {
    expect(slugify('')).toBe('')
  })

  it('should handle string with only special characters', () => {
    expect(slugify('!@#$%')).toBe('')
  })

  it('should preserve numbers', () => {
    expect(slugify('test123')).toBe('test123')
    expect(slugify('version 2.0')).toBe('version-20')
  })

  it('should handle single characters', () => {
    expect(slugify('A')).toBe('a')
    expect(slugify(' ')).toBe('')
  })
})
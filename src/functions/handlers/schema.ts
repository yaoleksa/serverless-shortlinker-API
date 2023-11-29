export default {
  type: "object",
  properties: {
    url: { type: 'string' },
    type: { type: 'string' },
  },
  required: ['url', 'type']
} as const;

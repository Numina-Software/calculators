A low-level only fork of Alpertron Calculators that builds up to WASM so some of the functions can be imported and used in ACalc.
ACalc matches the GPL3 license and will come public soon.

### Compilation

```shell
# divisors
emcc -DFACTORIZATION_APP=1 -DFACTORIZATION_FUNCTIONS=1 -D_USING64BITS_ -g -Os -DDEBUG_CODE=27 expression.c parseexpr.c partition.c errors.c copyStr.c bigint.c division.c baseconv.c karatsuba.c modmult.c sqroot.c \
factor.c ecm.c siqs.c siqsLA.c ecmfront.c sumSquares.c bignbr.c showtime.c from_musl.c inputstr.c batch.c fft.c gcdrings.c fromBlockly.c linkedbignbr.c test.c -lm -o dist/divisors -s STANDALONE_WASM

# factors
emcc -DFACTORIZATION_APP=1 -DFACTORIZATION_FUNCTIONS=1 -D_USING64BITS_ -g -Os -DDEBUG_CODE=13 expression.c parseexpr.c partition.c errors.c copyStr.c bigint.c division.c baseconv.c karatsuba.c modmult.c sqroot.c factor.c ecm.c siqs.c siqsLA.c ecmfront.c sumSquares.c bignbr.c showtime.c from_musl.c inputstr.c batch.c fft.c gcdrings.c fromBlockly.c linkedbignbr.c test.c -lm -o dist/ecm -s STANDALONE_WASM

# test

wasmtime divisors.wasm 115792089237316195423570985008687907852837564279074904382605163141518161494336
wasmtime ecm.wasm 115792089237316195423570985008687907852837564279074904382605163141518161494336
```

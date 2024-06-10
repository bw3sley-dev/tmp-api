import fs from 'fs';
import { readCsv } from "./upload_file";
const csvParser = require('csv-parser');
import { prisma } from '@/lib/prisma'

const path = require('path');
export async function readCsv(req, res) {
    try {
        const { filename, file, mimetype } = req.body.csvFile;
    
        console.log('tessssssssssssssste ', req.body.csvFile._buf);
        // Salvar o arquivo
        const filePath = `./uploads/${filename}`;
        console.log('filePath ', filePath);

        // Verifique se os dados do buffer são válidos
        if (!req.body.csvFile._buf || req.body.csvFile._buf.length === 0) {
            return res.status(400).send('O buffer do arquivo está vazio.');
        }
        // Defina o caminho onde o arquivo será salvo
        const savePath = path.join(__dirname, '../../../../uploads/', filename);

        // Certifique-se de que o diretório de upload existe
        if (!fs.existsSync(path.dirname(savePath))) {
            fs.mkdirSync(path.dirname(savePath), { recursive: true });
        }

        // Cria um stream de gravação
        const writeStream = fs.createWriteStream(savePath);

        // Grava os dados do buffer no arquivo
         fs.writeFile(savePath, req.body.csvFile._buf, 'base64', (err) => {
            if (err) {
                console.error('Erro ao salvar o arquivo:', err);
                return res.status(500).send('Erro ao salvar o arquivo.');
            }

            res.status(200).send('Arquivo salvo com sucesso.');
        });
        // // Finaliza o stream
        writeStream.end();

        writeStream.on('finish', () => {
            res.status(200).send('Arquivo salvo com sucesso.');
        });

        writeStream.on('error', (err) => {
            console.error(err);
            res.status(500).send('Erro ao salvar o arquivo.');
        });
        

        var cabecalho = null;
        const data = [];
        let idx = 0;
        let info_atleta = []
        // Ler o arquivo CSV e analisar seu conteúdo
        await fs.createReadStream(filePath)
          .pipe(csvParser())
          .on('data', (row) => {
              if (idx === 0) { // Se for a primeira linha, armazena como cabeçalho
                  cabecalho = Object.keys(row); // Assume que as chaves do objeto são os nomes das colunas
              }
              // console.log('Arquivo: ', row);
              // Processar cada linha do CSV
              data.push(row);
              idx++; // Incrementa o índice
          })
          .on('end', async () => {
              // Ao finalizar a leitura do arquivo, enviar os dados de volta como resposta
              console.log('Cabeçalho: ', cabecalho); // Imprime o cabeçalho no console

              //Roda um loop lendo o arquivo
              for (let ct in data) {
                console.log('data posicao: ', data[ct][cabecalho]);

                //Le as informações do arquivo
                let info = data[ct][cabecalho].split(';');
                info_atleta[ct] = {};
                info_atleta[ct].nome = info[0];
                info_atleta[ct].dt_nasc = info[1];
                info_atleta[ct].sexo = info[2];
                info_atleta[ct].lateralidade = info[3];


                //Converte a data para timestamp
                const partes = info[1].split('/');

                // Verifica se a data está no formato correto (dd/mm/aaaa)
                if (partes.length !== 3) {
                    throw new Error('Formato de data inválido. Use dd/mm/aaaa.');
                }
                
                // Reordena as partes para o formato americano (aaaa-mm-dd) e as une com o separador '-'
                const dataAmericana =  new Date(`${partes[2]}-${partes[1]}-${partes[0]}`);
                const timestamp = dataAmericana.getTime();

                info_atleta[ct].dt_nasc = timestamp;

                //Traduz para o campo do banco
                if (info_atleta[ct].sexo == 'Feminino') {
                  info_atleta[ct].sexo = 'FEMALE';
                } else {
                  info_atleta[ct].sexo = 'MALE';
                }

             
                //Pega o id do Guardian
                const getAGuardian = await prisma.guardian.findMany({
                  where: { email: 'carloscjm9@gmail.com' }
                })
            
                if (!getAGuardian) {
                  return reply.status(404).send({ message: 'Failed to get athlete' })
                } else {
                  console.log('Athlete getAGuardian: ', getAGuardian);
                }

                //Insere o athleta
                const createAthlete = await prisma.athlete.create({
                  data: {
                    name: info_atleta[ct].nome,
                    gender: info_atleta[ct].sexo,
                    handedness: 'LEFT',
                    // handedness: info_atleta[ct].lateralidade,
                    guardian_id: getAGuardian[0].id,
                    birth_date: new Date(timestamp),
                  }
                })
            
                if (!createAthlete) {
                  return reply.status(404).send({ message: 'Failed to Create athlete status' })
                } else {
                  console.log('Athlete Inserido com sucesso: ', createAthlete);
                }
              }
              console.log('data info: ', info_atleta);
              res.send({ data });
          });
          return res.status(200).send({ success: 'Arquivo lido com sucesso' });
        
      } catch (err) {
        console.error('Erro ao fazer upload do arquivo:', err);
        return res.status(500).send({ error: 'Erro interno do servidor ao fazer upload do arquivo' });
      }
  }
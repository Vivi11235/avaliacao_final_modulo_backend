import express from 'express'

import cors from 'cors'

import crypto from 'node:crypto'

const app = express();

app.use(express.json());

app.use(cors())

app.get('/', (request, response) => {
    return response.status(200).send('<h1>Bem-vindo ao sistema de cadastro de recados!</h1><p>Proceda ao seu cadastro:</p>');
    });

app.listen(8079, () => console.log("Servidor iniciado"));

const listaUsuarios = [];

app.post('/cadastro', (request, response) => {
    const dados = request.body

    const usuario = listaUsuarios.find((user) => user.email === dados.email)

    if(usuario){
        return response.status(400).json({
            sucess: false,
            message: 'Nome de usuário já existe. Cadastre um novo usuário',
            data: {}
        })
    }

    if(!dados.nome){
        return response.status(400).json("O campo nome é obrigatório")
    }

    if(!dados.email){
        return response.status(400).json("O campo e-mail é obrigatório")
    }

    if(!dados.senha){
        return response.status(400).json("O campo senha é obrigatório")
    }

    const novoUsuario = {
        id: new Date().getTime(),
        nome: dados.nome,
        email: dados.email,
        senha: dados.senha,
        logado: false
    }

    listaUsuarios.push(novoUsuario)

    return response.status(201).json({
        sucess: true,
        message: 'Usuario criado com sucesso',
        data: novoUsuario
    })
})

app.post('/login', (request, response) => {
    const data = request.body

    const usuario = listaUsuarios.find((user) => user.email === data.email)

    const senha = listaUsuarios.find((user) => user.senha === data.senha)

    if(!usuario||!senha){
        return response.status(400).json({
            sucess: false,
            message: 'E-mail ou senha estão incorretos',
            data: {}
        })
    }

    listaUsuarios.forEach((usuario) => usuario.logado = false)

    const user = listaUsuarios.find((user) => user.email === data.email)

    user.logado = true

    return response.status(200).json({
        sucess: true,
        message: 'Login realizado com sucesso',
    })

})

const listaRecados = []

app.post('/recados', (request, response) => {
    const dados = request.body

    const user = listaUsuarios.find(user => user.logado === true)

    if(!user){
        return response.status(401).json({
            sucess: false,
            messsage: 'Necessário fazer login para criar um post',
            data: {}
        })
    }

    const novoRecado = {
        id: crypto.randomUUID(),
        titulo: dados.titulo,
        descricao: dados.descricao,
        autor: user
    }

    listaRecados.push(novoRecado)

    return response.status(201).json({
        sucess: true,
        message: 'Recado criado com sucesso',
        data: novoRecado
    })
})

app.get('/listar-recados/:id', (request, response) => {
    const params = request.params

    const user = listaUsuarios.find(user => user.logado === true)

    if(!user){
        return response.status(401).json({
            sucess: false,
            messsage: 'Necessário fazer login para listar seus recados',
            data: {}
        })
    }

    const recado = listaRecados.find(recado =>recado.id === params.id)

    if(!recado){
        return response.status(404).json({
            sucess: false,
            messsage: 'Recado não encontrado',
            data: {}
        })
    }

    const recadoListado = {
        id: recado.id,
        titulo: recado.titulo,
        descricao: recado.descricao,
        autor: user
    }

    return response.status(200).json({
        sucess: true,
        message: 'Recado listado com sucesso',
        data: recadoListado
    })

})

app.put('/recados/:id', (request, response) => {
    const params = request.params

    const user = listaUsuarios.find(user => user.logado === true)
    
    const recadoExiste = listaRecados.findIndex(recado => recado.id == params.id)

    const recado = listaRecados.find(recado =>recado.id === params.id)

    if(!user){
        return response.status(400).json({
            sucess: false,
            messsage: 'Necessário fazer login para atualizar um recado',
            data: {}
        })
    }

    if(recadoExiste<0){
        return response.status(404).json({
            sucess: false,
            messsage: 'Recado não encontrado',
            data: {}
        })
    }

    listaRecados[recadoExiste].titulo = request.body.titulo
    listaRecados[recadoExiste].descricao = request.body.descricao

    listaRecados.splice(recadoExiste, 1)

    listaRecados.push(recado)

    return response.status(200).json({
        sucess: true,
        message: 'Recado atualizado com sucesso',
        data: recado
    })

})

app.delete('/recados/:id', (request, response) => {
    const params = request.params

    const user = listaUsuarios.find(user => user.logado === true)

    if(!user){
        return response.status(400).json({
            sucess: false,
            messsage: 'Necessário fazer login para deletar um recado',
            data: {}
        })
    }

    const recadoExiste = listaRecados.findIndex(recado =>recado.id === params.id)

    if(recadoExiste < 0){
        return response.status(404).json({
            sucess: false,
            messsage: 'Recado não encontrado',
            data: {}
        })
    }

    listaRecados.splice(recadoExiste, 1)

    return response.status(200).json({
        sucess: true,
        message: 'Recado deletado com sucesso',
    })
})